const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const InventoryTransaction = require("../models/InventoryTransaction");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const { notifyUsersByRoles } = require("../domain/notificationHelper");

/**
 * Safe inventory deduction with transaction support and duplicate prevention
 * Ensures stock is only deducted once per order
 */
const deductStockForOrder = async (orderData, session = null) => {
  const {
    items = [],
    preferredBranch = "",
    orderCode = "",
    trackingNumber = "",
    userId = null,
  } = orderData;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  const transactionRecords = [];
  const auditLogs = [];
  let orderDoc = null;

  try {
    const operations = [];

    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity < 1) {
        throw new Error(`Invalid item: productId=${productId}, quantity=${quantity}`);
      }

      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      const currentStock = Number(product.stock || 0);
      if (currentStock < quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${quantity}`
        );
      }

      const newStock = currentStock - quantity;
      product.stock = newStock;
      product.branchStock.set(
        preferredBranch,
        Math.max(0, (Number(product.branchStock?.get(preferredBranch) || 0) - quantity))
      );

      operations.push({
        type: "deduction",
        product,
        productId,
        quantity,
        branch: preferredBranch,
      });

      transactionRecords.push({
        actionType: "order_deduction",
        product: product._id,
        branch: preferredBranch,
        user: userId,
        quantity,
        referenceType: "order",
        referenceNumber: orderCode,
        relatedEntityType: "order",
        trackingNumber,
        notes: `Order ${orderCode} deducted ${quantity} units from ${preferredBranch}`,
        productName: product.name,
      });

      auditLogs.push({
        action: "order_deduction",
        user: userId,
        branch: preferredBranch,
        entityType: "product",
        entityId: product._id,
        changeDetails: {
          before: { stock: currentStock },
          after: { stock: newStock },
        },
        description: `Order ${orderCode} deducted ${quantity} units from ${product.name}`,
      });
    }

    // Save all products atomically
    for (const op of operations) {
      await op.product.save({ session });
    }

    // Record transactions within session
    if (transactionRecords.length > 0) {
      await InventoryTransaction.insertMany(transactionRecords, { session });
    }

    // Record audit logs within session
    if (auditLogs.length > 0) {
      await AuditLog.insertMany(auditLogs, { session });
    }

    return {
      success: true,
      operations: operations.length,
      transactionCount: transactionRecords.length,
    };
  } catch (error) {
    throw new Error(`Stock deduction failed: ${error.message}`);
  }
};

const getBranchStockValue = (product, branch) => Math.max(0, Number(product.branchStock?.get(branch) || 0));

const allocateProductStock = (product, quantityNeeded, preferredBranch, branchSearchOrder = []) => {
  const normalizedQuantity = Math.max(0, Number(quantityNeeded) || 0);
  const searchOrder = Array.isArray(branchSearchOrder) ? branchSearchOrder.filter(Boolean) : [];
  const branchAvailability = searchOrder.map((branch) => ({
    branch,
    available: getBranchStockValue(product, branch),
  }));

  const hasBranchSnapshot = branchAvailability.some(({ available }) => available > 0);
  if (hasBranchSnapshot) {
    const totalAvailable = branchAvailability.reduce((sum, item) => sum + item.available, 0);
    if (totalAvailable < normalizedQuantity) {
      throw new Error(`Insufficient stock for ${product.name}. Only ${totalAvailable} remaining.`);
    }

    let remaining = normalizedQuantity;
    const allocations = [];
    for (const { branch, available } of branchAvailability) {
      if (remaining <= 0) break;
      const deducted = Math.min(available, remaining);
      if (deducted <= 0) continue;
      product.branchStock.set(branch, available - deducted);
      allocations.push({ branch, deducted });
      remaining -= deducted;
    }
    product.stock = branchSearchOrder.reduce((sum, branch) => sum + getBranchStockValue(product, branch), 0);
    return allocations;
  }

  const totalAvailable = Math.max(0, Number(product.stock || 0));
  if (totalAvailable < normalizedQuantity) {
    throw new Error(`Insufficient stock for ${product.name}. Only ${totalAvailable} remaining.`);
  }

  const branchName = preferredBranch || searchOrder[0] || "";
  const remaining = totalAvailable - normalizedQuantity;
  if (branchName) {
    product.branchStock.set(branchName, Math.max(0, getBranchStockValue(product, branchName) - normalizedQuantity));
  }
  product.stock = remaining;
  return branchName ? [{ branch: branchName, deducted: normalizedQuantity }] : [];
};

const logOrderDeductionTransactions = async (
  { items = [], orderCode = "", trackingNumber = "", userId = null, orderId = null, session = null } = {}
) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { transactionCount: 0, auditCount: 0 };
  }

  const transactionRecords = [];
  const auditLogs = [];

  for (const item of items) {
    const { product, allocations = [], sourceBranch = "" } = item;
    const productName = product?.name || "Unknown product";
    for (const allocation of allocations) {
      const branch = allocation.branch || sourceBranch || "";
      transactionRecords.push({
        actionType: "order_deduction",
        product: product._id,
        branch,
        user: userId,
        quantity: allocation.deducted,
        referenceType: "order",
        referenceNumber: orderCode,
        relatedEntityType: "order",
        relatedEntityId: orderId,
        order: orderId,
        trackingNumber,
        notes: `Order ${orderCode} deducted ${allocation.deducted} unit(s) from ${branch}`,
        productName,
      });

      auditLogs.push({
        action: "order_deduction",
        user: userId,
        branch,
        entityType: "order",
        entityId: orderId,
        changeDetails: {
          before: { productId: String(product._id), quantity: allocation.deducted },
          after: { productId: String(product._id), quantity: allocation.deducted },
        },
        description: `Order ${orderCode} deducted ${allocation.deducted} unit(s) of ${productName} from ${branch}`,
      });
    }
  }

  if (transactionRecords.length > 0) {
    await InventoryTransaction.insertMany(transactionRecords, { session });
  }

  if (auditLogs.length > 0) {
    await AuditLog.insertMany(auditLogs, { session });
  }

  return {
    transactionCount: transactionRecords.length,
    auditCount: auditLogs.length,
  };
};

const logStockAddition = async (
  product,
  quantity,
  { branch = "", userId = null, reason = "manual_addition", session = null } = {}
) => {
  if (!product || !product._id || quantity < 1) {
    throw new Error("Invalid product or quantity");
  }

  const actionType = "stock_addition";
  const referenceType = reason;
  const referenceNumber = String(product._id);

  await InventoryTransaction.create(
    [
      {
        actionType,
        product: product._id,
        branch,
        user: userId,
        quantity,
        referenceType,
        referenceNumber,
        relatedEntityType: "product",
        relatedEntityId: product._id,
        notes: `Stock addition for ${product.name}: ${quantity} units`,
        productName: product.name,
      },
    ],
    { session }
  );

  await AuditLog.create(
    [
      {
        action: actionType,
        user: userId,
        branch,
        entityType: "product",
        entityId: product._id,
        changeDetails: {
          before: { stock: Number(product.stock || 0) - quantity },
          after: { stock: Number(product.stock || 0) },
        },
        description: `Added ${quantity} units to ${product.name}`,
      },
    ],
    { session }
  );

  return { success: true };
};

/**
 * Safe stock addition with validation and logging
 */
const addStockForProduct = async (
  productId,
  quantity,
  { branch = "", userId = null, reason = "manual_addition", session = null }
) => {
  if (!productId || quantity < 1) {
    throw new Error("Invalid product or quantity");
  }

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error("Product not found");
    }

    const oldStock = Number(product.stock || 0);
    const newStock = oldStock + quantity;

    if (branch) {
      const branchCurrent = Number(product.branchStock?.get(branch) || 0);
      product.branchStock.set(branch, branchCurrent + quantity);
    }
    product.stock = newStock;

    await product.save({ session });

    await InventoryTransaction.create(
      [
        {
          actionType: "stock_addition",
          product: product._id,
          branch,
          user: userId,
          quantity,
          referenceType: reason,
          referenceNumber: String(productId),
          relatedEntityType: "product",
          relatedEntityId: product._id,
          notes: `Stock addition for ${product.name}: ${quantity} units`,
          productName: product.name,
        },
      ],
      { session }
    );

    await AuditLog.create(
      [
        {
          action: "stock_addition",
          user: userId,
          branch,
          entityType: "product",
          entityId: product._id,
          changeDetails: {
            before: { stock: oldStock },
            after: { stock: newStock },
          },
          description: `Added ${quantity} units to ${product.name}`,
        },
      ],
      { session }
    );

    return { success: true, newStock };
  } catch (error) {
    throw new Error(`Stock addition failed: ${error.message}`);
  }
};

/**
 * Record inventory adjustment (approval of inventory change request)
 */
const recordAdjustment = async (
  productId,
  oldStock,
  newStock,
  { branch = "", userId = null, reason = "", session = null }
) => {
  if (!productId || newStock < 0) {
    throw new Error("Invalid product or stock value");
  }

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error("Product not found");
    }

    const delta = newStock - oldStock;

    await InventoryTransaction.create(
      [
        {
          actionType: "stock_adjustment",
          product: product._id,
          branch,
          user: userId,
          quantity: Math.abs(delta),
          referenceType: "inventory_adjustment",
          referenceNumber: String(productId),
          relatedEntityType: "product",
          relatedEntityId: product._id,
          notes: reason || `Inventory adjusted for ${product.name}: ${oldStock} → ${newStock}`,
          productName: product.name,
        },
      ],
      { session }
    );

    await AuditLog.create(
      [
        {
          action: "inventory_adjustment",
          user: userId,
          branch,
          entityType: "product",
          entityId: product._id,
          changeDetails: {
            before: { stock: oldStock },
            after: { stock: newStock },
          },
          description: `Adjusted inventory for ${product.name}: ${oldStock} → ${newStock}`,
        },
      ],
      { session }
    );

    return { success: true, delta };
  } catch (error) {
    throw new Error(`Adjustment recording failed: ${error.message}`);
  }
};

/**
 * Safe wrapper for transactional inventory operations
 */
const executeWithSession = async (operation) => {
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      return await operation(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Verify order stock deduction idempotency
 */
const checkOrderDeductionIdempotency = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return { exists: false };

  const transactions = await InventoryTransaction.find({
    relatedEntityType: "order",
    relatedEntityId: orderId,
    actionType: "order_deduction",
  });

  return {
    exists: true,
    order: {
      id: order._id,
      code: order.orderCode,
      itemCount: (order.items || []).length,
    },
    transactions: {
      count: transactions.length,
      items: transactions.map((t) => ({
        product: String(t.product),
        quantity: t.quantity,
        branch: t.branch,
        createdAt: t.createdAt,
      })),
    },
    isDuplicate: transactions.length > (order.items || []).length,
  };
};

/**
 * Repair duplicate deductions (administrative function)
 */
const repairDuplicateDeductions = async (orderId) => {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new Error("Order not found");
      }

      const transactions = await InventoryTransaction.find({
        relatedEntityType: "order",
        relatedEntityId: orderId,
        actionType: "order_deduction",
      }).session(session);

      if (transactions.length <= (order.items || []).length) {
        return { repaired: false, message: "No duplicates detected" };
      }

      // Group by product to detect which were duplicated
      const productMap = {};
      for (const tx of transactions) {
        const key = String(tx.product);
        if (!productMap[key]) {
          productMap[key] = [];
        }
        productMap[key].push(tx);
      }

      const duplicates = [];
      let refundTotal = 0;

      for (const [productId, txs] of Object.entries(productMap)) {
        if (txs.length > 1) {
          const expectedTxCount = order.items.filter((item) =>
            String(item.productId) === productId
          ).length;

          if (txs.length > expectedTxCount) {
            const excessTxs = txs.slice(expectedTxCount);
            for (const tx of excessTxs) {
              const product = await Product.findById(tx.product).session(session);
              if (product) {
                product.stock += tx.quantity;
                product.branchStock.set(
                  tx.branch,
                  (Number(product.branchStock?.get(tx.branch) || 0) + tx.quantity)
                );
                await product.save({ session });

                refundTotal += tx.quantity;
                duplicates.push({
                  transactionId: String(tx._id),
                  product: product.name,
                  quantity: tx.quantity,
                });
              }

              await InventoryTransaction.findByIdAndDelete(tx._id, { session });
            }
          }
        }
      }

      return {
        repaired: true,
        orderId: String(order._id),
        orderCode: order.orderCode,
        duplicatesRemoved: duplicates.length,
        unitsRefunded: refundTotal,
        details: duplicates,
      };
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  deductStockForOrder,
  addStockForProduct,
  recordAdjustment,
  executeWithSession,
  checkOrderDeductionIdempotency,
  repairDuplicateDeductions,
};
