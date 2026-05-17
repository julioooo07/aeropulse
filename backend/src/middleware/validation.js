/**
 * Validation middleware for inventory and order operations
 * Ensures data consistency and prevents invalid state transitions
 */

const Product = require("../models/Product");
const Order = require("../models/Order");
const { BRANCHES } = require("../domain/branchRouting");

class ValidationError extends Error {
  constructor(message, code = "VALIDATION_ERROR", statusCode = 400) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Validate order items against available inventory
 */
const validateOrderItems = async (items, branch = "") => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Order must contain at least one item", "EMPTY_CART");
  }

  const errors = [];
  const validatedItems = [];

  for (const item of items) {
    const { productId, quantity } = item;

    if (!productId) {
      errors.push("Item missing productId");
      continue;
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      errors.push(`Item ${productId}: invalid quantity ${quantity}`);
      continue;
    }

    const product = await Product.findById(productId);
    if (!product) {
      errors.push(`Product not found: ${productId}`);
      continue;
    }

    if (!product.isActive) {
      errors.push(`Product not available: ${product.name}`);
      continue;
    }

    const branchStock = Number(product.branchStock?.get(branch) || 0);
    const totalStock = Number(product.stock || 0);
    const available = branch ? branchStock : totalStock;

    if (available < qty) {
      errors.push(
        `Insufficient stock for ${product.name}. Available: ${available}, Requested: ${qty}`
      );
      continue;
    }

    validatedItems.push({
      ...item,
      product,
      branchStock,
      totalStock,
    });
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join("; ")}`, "ITEM_VALIDATION_FAILED");
  }

  return validatedItems;
};

/**
 * Validate branch is legitimate
 */
const validateBranch = (branch) => {
  if (!branch) {
    throw new ValidationError("Branch is required", "MISSING_BRANCH");
  }

  if (!BRANCHES.includes(branch)) {
    throw new ValidationError(`Invalid branch: ${branch}`, "INVALID_BRANCH");
  }

  return branch;
};

/**
 * Validate user has access to branch
 */
const validateUserBranchAccess = (user, branch) => {
  if (!user) {
    throw new ValidationError("User not found", "USER_NOT_FOUND", 401);
  }

  if (user.role === "superadmin") {
    return true; // Superadmin can access all branches
  }

  if (user.role === "admin" || user.role === "technician") {
    const hasAccess =
      user.activeBranch === branch ||
      user.assignedBranch === branch ||
      (Array.isArray(user.allowedBranches) && user.allowedBranches.includes(branch));

    if (!hasAccess) {
      throw new ValidationError(
        `Access denied to branch ${branch}`,
        "BRANCH_ACCESS_DENIED",
        403
      );
    }

    return true;
  }

  throw new ValidationError("Insufficient permissions", "INSUFFICIENT_PERMISSIONS", 403);
};

/**
 * Validate product stock update
 */
const validateStockUpdate = async (productId, oldStock, newStock) => {
  if (!productId) {
    throw new ValidationError("Product ID is required", "MISSING_PRODUCT_ID");
  }

  const oldVal = Number(oldStock);
  const newVal = Number(newStock);

  if (!Number.isFinite(oldVal) || oldVal < 0) {
    throw new ValidationError("Invalid old stock value", "INVALID_STOCK_VALUE");
  }

  if (!Number.isFinite(newVal) || newVal < 0) {
    throw new ValidationError("Invalid new stock value", "INVALID_STOCK_VALUE");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ValidationError("Product not found", "PRODUCT_NOT_FOUND", 404);
  }

  const currentStock = Number(product.stock || 0);
  if (Math.abs(currentStock - oldVal) > 1) {
    // Allow small timing differences but catch major inconsistencies
    throw new ValidationError(
      `Stock mismatch. Expected: ${oldVal}, Current: ${currentStock}`,
      "STOCK_MISMATCH",
      409
    );
  }

  return { product, delta: newVal - oldVal };
};

/**
 * Validate order state transition
 */
const validateOrderStateTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    to_pay: ["to_deliver", "cancelled"],
    to_deliver: ["to_install", "cancelled"],
    to_install: ["complete", "cancelled"],
    complete: [],
    cancelled: [],
  };

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(
      `Invalid state transition: ${currentStatus} → ${newStatus}`,
      "INVALID_STATE_TRANSITION"
    );
  }

  return true;
};

/**
 * Validate notification parameters
 */
const validateNotification = ({ userId, title, message, actionUrl = "" }) => {
  if (!userId) {
    throw new ValidationError("userId is required", "MISSING_USER_ID");
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw new ValidationError("title is required and must be non-empty", "INVALID_TITLE");
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new ValidationError("message is required and must be non-empty", "INVALID_MESSAGE");
  }

  if (actionUrl && typeof actionUrl !== "string") {
    throw new ValidationError("actionUrl must be a string", "INVALID_ACTION_URL");
  }

  return true;
};

/**
 * Middleware to catch validation errors
 */
const handleValidationError = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  }
  next(err);
};

/**
 * Middleware to validate auth user
 */
const requireValidUser = (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.authUser._id) {
    return res.status(401).json({ message: "Invalid user" });
  }

  next();
};

/**
 * Middleware to validate and resolve branch
 */
const validateAndResolveBranch = (req, res, next) => {
  try {
    const branch = validateBranch(req.activeBranch || req.headers["x-branch"] || "");
    validateUserBranchAccess(req.authUser, branch);
    req.validatedBranch = branch;
    next();
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        message: err.message,
        code: err.code,
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  ValidationError,
  validateOrderItems,
  validateBranch,
  validateUserBranchAccess,
  validateStockUpdate,
  validateOrderStateTransition,
  validateNotification,
  handleValidationError,
  requireValidUser,
  validateAndResolveBranch,
};
