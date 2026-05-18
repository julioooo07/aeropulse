const RestockOrder = require("../models/RestockOrder");
const Product = require("../models/Product");
const AuditLog = require("../models/AuditLog");
const InventoryTransaction = require("../models/InventoryTransaction");
const User = require("../models/User");
const { BRANCHES } = require("../domain/branchRouting");
const { notifyUsersByRoles } = require("../domain/notificationHelper");

/**
 * Owner creates a restock order
 */
const createRestockOrder = async (req, res) => {
  if (req.authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Only owners can create restock orders" });
  }

  const { supplier, branches, products, expectedDeliveryStart, expectedDeliveryEnd, notes, trackingNumber, deliveryCompany, deliveredBy } = req.body;

  if (!supplier?.name || !branches?.length || !products?.length) {
    return res.status(400).json({ message: "Supplier, branches, and products are required" });
  }

  if (!expectedDeliveryStart || !expectedDeliveryEnd) {
    return res.status(400).json({ message: "Expected delivery dates are required" });
  }

  const startDate = new Date(expectedDeliveryStart);
  const endDate = new Date(expectedDeliveryEnd);

  if (startDate >= endDate) {
    return res.status(400).json({ message: "Delivery end date must be after start date" });
  }

  try {
    // Validate all products exist
    const productIds = products.map((p) => p.product);
    const foundProducts = await Product.find({ _id: { $in: productIds } });
    if (foundProducts.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products not found" });
    }

    // Validate branches
    const validBranches = branches.filter((b) => BRANCHES.includes(b));
    if (validBranches.length === 0) {
      return res.status(400).json({ message: "Invalid branch(es)" });
    }

    const restockOrder = await RestockOrder.create({
      supplier,
      branches: validBranches,
      products,
      expectedDeliveryStart: startDate,
      expectedDeliveryEnd: endDate,
      createdBy: req.authUser._id,
      trackingNumber: String(trackingNumber || "").trim(),
      deliveryCompany: String(deliveryCompany || "").trim(),
      deliveredBy: String(deliveredBy || "").trim(),
      notes: notes?.trim() || "",
      status: "pending_signal",
    });

    // Create audit log
    await AuditLog.create({
      action: "restock_order_created",
      user: req.authUser._id,
      entityType: "restock_order",
      entityId: restockOrder._id,
      description: `Created restock order from ${supplier.name} for ${validBranches.join(", ")} with ${products.length} products`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ restockOrder: restockOrder.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Owner signals restock order to managers
 */
const signalRestockOrder = async (req, res) => {
  if (req.authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Only owners can signal restock orders" });
  }

  const { id } = req.params;

  const restockOrder = await RestockOrder.findById(id);
  if (!restockOrder) {
    return res.status(404).json({ message: "Restock order not found" });
  }

  if (restockOrder.status !== "pending_signal") {
    return res.status(400).json({ message: "Only pending orders can be signalled" });
  }

  try {
    restockOrder.status = "incoming";
    restockOrder.signalledAt = new Date();
    await restockOrder.save();

    // Create audit log
    await AuditLog.create({
      action: "restock_order_signalled",
      user: req.authUser._id,
      entityType: "restock_order",
      entityId: restockOrder._id,
      description: `Signalled restock order from ${restockOrder.supplier.name}`,
      ipAddress: req.ip,
    });

    // Notify managers at affected branches
    const managers = await User.find({
      role: "admin",
      assignedBranch: { $in: restockOrder.branches },
    });

    const formatDateRange = (start, end) => {
      const s = new Date(start).toLocaleDateString();
      const e = new Date(end).toLocaleDateString();
      return `${s} - ${e}`;
    };

    await notifyUsersByRoles({
      roles: ["admin"],
      title: "Restock Incoming",
      message: `Restock from ${restockOrder.supplier.name} expected ${formatDateRange(
        restockOrder.expectedDeliveryStart,
        restockOrder.expectedDeliveryEnd
      )}. ${restockOrder.products.length} product(s)`,
      actionUrl: "/admin/inventory",
      entityType: "restock_order",
      entityId: String(restockOrder._id),
    });

    return res.json({ restockOrder: restockOrder.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Manager marks restock as received
 */
const markRestockReceived = async (req, res) => {
  if (req.authUser.role !== "admin" && req.authUser.role !== "technician") {
    return res.status(403).json({ message: "Only managers can mark restock as received" });
  }

  const { id } = req.params;
  const { receivedProducts, trackingNumber, deliveryCompany, deliveredBy, deliveryDate, notes } = req.body || {};

  const restockOrder = await RestockOrder.findById(id);
  if (!restockOrder) {
    return res.status(404).json({ message: "Restock order not found" });
  }

  if (restockOrder.status !== "incoming") {
    return res.status(400).json({ message: "Only incoming orders can be marked as received" });
  }

  if (!String(trackingNumber || "").trim()) {
    return res.status(400).json({ message: "Tracking order number is required" });
  }
  if (!String(deliveryCompany || "").trim()) {
    return res.status(400).json({ message: "Delivery company is required" });
  }
  if (!String(deliveredBy || "").trim()) {
    return res.status(400).json({ message: "Delivered by is required" });
  }
  const parsedDeliveryDate = deliveryDate ? new Date(deliveryDate) : null;
  if (!parsedDeliveryDate || Number.isNaN(parsedDeliveryDate.getTime())) {
    return res.status(400).json({ message: "Valid delivery date is required" });
  }

  try {
    // Update received quantities and validate received values
    if (!Array.isArray(receivedProducts) || receivedProducts.length === 0) {
      return res.status(400).json({ message: "At least one received product is required" });
    }

    for (const received of receivedProducts) {
      const productEntry = restockOrder.products.find(
        (p) => p.product.toString() === received.productId
      );
      const quantityValue = Number(received.quantity);
      if (!productEntry) {
        return res.status(400).json({ message: `Invalid product ${received.productId}` });
      }
      if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
        return res.status(400).json({ message: `Received quantity must be a positive number for product ${productEntry.product}` });
      }
      if (quantityValue > productEntry.quantity) {
        return res.status(400).json({ message: `Received quantity for ${productEntry.product} cannot exceed ordered quantity` });
      }
      productEntry.receivedQuantity = quantityValue;
    }

    // Update inventory
    for (const productEntry of restockOrder.products) {
      const product = await Product.findById(productEntry.product);
      if (product) {
        const receivedQty = productEntry.receivedQuantity || productEntry.quantity;

        // Add received quantity to each branch
        for (const branch of restockOrder.branches) {
          const current = Number(product.branchStock.get(branch) || 0);
          product.branchStock.set(branch, current + receivedQty);
        }

        product.stock = Array.from(product.branchStock.values()).reduce((sum, val) => sum + val, 0);
        await product.save();

        const inventoryTransaction = await InventoryTransaction.create({
          actionType: "restock_receipt",
          restockOrder: restockOrder._id,
          product: product._id,
          branch: req.activeBranch || "",
          user: req.authUser._id,
          quantity: receivedQty,
          referenceType: "restock_order",
          referenceNumber: String(trackingNumber || "").trim() || String(restockOrder._id),
          relatedEntityType: "RestockOrder",
          relatedEntityId: restockOrder._id,
          trackingNumber: String(trackingNumber || "").trim(),
          deliveryCompany: String(deliveryCompany || "").trim(),
          deliveredBy: String(deliveredBy || "").trim(),
          receivedBy: req.authUser._id,
          deliveryDate: parsedDeliveryDate,
          notes: String(notes || "").trim(),
          supplierName: String(restockOrder.supplier?.name || "").trim(),
          productName: String(product.name || "").trim(),
        });

        // Create audit log for each product
        await AuditLog.create({
          action: "inventory_transaction_created",
          user: req.authUser._id,
          branch: req.activeBranch,
          entityType: "inventory_transaction",
          entityId: inventoryTransaction._id,
          changeDetails: {
            before: { quantity: productEntry.quantity },
            after: { quantity: receivedQty, branches: restockOrder.branches },
          },
          description: `Recorded inventory receipt of ${receivedQty} units of ${product.name} from ${restockOrder.supplier.name}`,
          ipAddress: req.ip,
        });
      }
    }

    // Update order status and receipt metadata
    restockOrder.status = "received";
    restockOrder.receivedAt = new Date();
    restockOrder.receivedBy = req.authUser._id;
    restockOrder.actualDeliveryDate = parsedDeliveryDate;
    restockOrder.trackingNumber = String(trackingNumber || "").trim();
    restockOrder.deliveryCompany = String(deliveryCompany || "").trim();
    restockOrder.deliveredBy = String(deliveredBy || "").trim();
    restockOrder.notes = String(notes || restockOrder.notes || "").trim();
    await restockOrder.save();

    await notifyUsersByRoles({
      roles: ["superadmin"],
      title: "Restock Received",
      message: `Restock from ${restockOrder.supplier.name} has been received at ${req.activeBranch}.`,
      actionUrl: "/superadmin/inventory",
      entityType: "restock_order",
      entityId: String(restockOrder._id),
    });

    return res.json({ restockOrder: restockOrder.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get restock orders
 */
const getRestockOrders = async (req, res) => {
  const { status, branch } = req.query;
  const query = {};

  if (status && ["pending_signal", "incoming", "received", "cancelled"].includes(status)) {
    query.status = status;
  }

  if (branch && BRANCHES.includes(branch)) {
    query.branches = branch;
  }

  try {
    const orders = await RestockOrder.find(query)
      .populate("createdBy", "name email")
      .populate("receivedBy", "name email")
      .populate("products.product", "name sku")
      .sort({ createdAt: -1 });

    return res.json({ restockOrders: orders.map((o) => o.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get restock orders for manager's branch
 */
const getMyRestockOrders = async (req, res) => {
  const branch = req.activeBranch;

  try {
    const orders = await RestockOrder.find({
      branches: branch,
      status: { $in: ["incoming", "received"] },
    })
      .populate("createdBy", "name email")
      .populate("products.product", "name sku")
      .sort({ createdAt: -1 });

    return res.json({ restockOrders: orders.map((o) => o.toJSON()) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Owner cancels a restock order
 */
const cancelRestockOrder = async (req, res) => {
  if (req.authUser.role !== "superadmin") {
    return res.status(403).json({ message: "Only owners can cancel restock orders" });
  }

  const { id } = req.params;
  const { reason } = req.body || {};

  const restockOrder = await RestockOrder.findById(id);
  if (!restockOrder) {
    return res.status(404).json({ message: "Restock order not found" });
  }

  if (["received", "cancelled"].includes(restockOrder.status)) {
    return res.status(400).json({ message: "Cannot cancel this order" });
  }

  try {
    restockOrder.status = "cancelled";
    restockOrder.cancellationReason = reason?.trim() || "";
    await restockOrder.save();

    // Create audit log
    await AuditLog.create({
      action: "restock_order_cancelled",
      user: req.authUser._id,
      entityType: "restock_order",
      entityId: restockOrder._id,
      description: `Cancelled restock order from ${restockOrder.supplier.name}: ${reason}`,
      ipAddress: req.ip,
    });

    return res.json({ restockOrder: restockOrder.toJSON() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRestockOrder,
  signalRestockOrder,
  markRestockReceived,
  getRestockOrders,
  getMyRestockOrders,
  cancelRestockOrder,
};
