const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");
const { BRANCHES } = require("../domain/branchRouting");

/**
 * Dashboard statistics service
 * Provides consistent, synchronized queries for dashboard display
 */

const CACHE_TTL = 60 * 1000; // 1 minute

class DashboardStatsCache {
  constructor() {
    this.cache = {};
  }

  set(key, value) {
    this.cache[key] = {
      value,
      timestamp: Date.now(),
    };
  }

  get(key, ttl = CACHE_TTL) {
    const item = this.cache[key];
    if (!item) return null;
    if (Date.now() - item.timestamp > ttl) {
      delete this.cache[key];
      return null;
    }
    return item.value;
  }

  clear() {
    this.cache = {};
  }

  clearKey(key) {
    delete this.cache[key];
  }
}

const statsCache = new DashboardStatsCache();

/**
 * Get order statistics with consistent queries
 */
const getOrderStats = async (branch = null) => {
  const cacheKey = `order_stats_${branch || "all"}`;
  const cached = statsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const query = {};
    if (branch && BRANCHES.includes(branch)) {
      query.$or = [{ customerBranch: branch }, { stockSourceBranch: branch }];
    }

    const statusCounts = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$workflowStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const stats = {
      branch: branch || "all",
      timestamp: new Date().toISOString(),
      byStatus: {},
      total: 0,
      totalRevenue: 0,
    };

    for (const item of statusCounts) {
      stats.byStatus[item._id] = {
        count: item.count,
        revenue: item.totalAmount,
      };
      stats.total += item.count;
      stats.totalRevenue += item.totalAmount;
    }

    statsCache.set(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error("Failed to get order stats:", error);
    return {
      error: error.message,
      branch: branch || "all",
    };
  }
};

/**
 * Get inventory statistics with branch breakdown
 */
const getInventoryStats = async (branch = null) => {
  const cacheKey = `inventory_stats_${branch || "all"}`;
  const cached = statsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const allProducts = await Product.find({ isActive: true }).lean();

    const stats = {
      branch: branch || "all",
      timestamp: new Date().toISOString(),
      total: 0,
      lowStock: [],
      outOfStock: [],
      critical: [],
      adequateStock: [],
    };

    for (const product of allProducts) {
      const stock = branch ? Number(product.branchStock?.get(branch) || 0) : Number(product.stock || 0);
      const threshold = Number(product.threshold || 0);

      const item = {
        id: String(product._id),
        name: product.name,
        sku: product.sku,
        specs: product.specs,
        stock,
        threshold,
      };

      stats.total += 1;

      if (stock === 0) {
        stats.outOfStock.push(item);
      } else if (stock <= (threshold * 0.5 || 2)) {
        stats.critical.push(item);
      } else if (stock < threshold) {
        stats.lowStock.push(item);
      } else {
        stats.adequateStock.push(item);
      }
    }

    statsCache.set(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error("Failed to get inventory stats:", error);
    return {
      error: error.message,
      branch: branch || "all",
    };
  }
};

/**
 * Get transaction summary for date range
 */
const getTransactionSummary = async (
  { from = null, to = null, branch = null, actionType = null } = {}
) => {
  try {
    const query = {};

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = from;
      if (to) query.createdAt.$lte = to;
    }

    if (branch) query.branch = branch;
    if (actionType) query.actionType = actionType;

    const transactions = await InventoryTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$actionType",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const summary = {
      period: {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      },
      branch: branch || "all",
      byAction: {},
      totalTransactions: 0,
      totalUnits: 0,
    };

    for (const item of transactions) {
      summary.byAction[item._id] = {
        count: item.count,
        units: item.totalQuantity,
      };
      summary.totalTransactions += item.count;
      summary.totalUnits += item.totalQuantity;
    }

    return summary;
  } catch (error) {
    console.error("Failed to get transaction summary:", error);
    return { error: error.message };
  }
};

/**
 * Verify data synchronization between Order and InventoryTransaction
 */
const verifySynchronization = async () => {
  try {
    const orderCount = await Order.countDocuments({});
    const allOrders = await Order.find({}).select("_id orderCode items").lean();

    const orphanedTransactions = [];
    const inconsistencies = [];

    for (const order of allOrders) {
      const txCount = await InventoryTransaction.countDocuments({
        relatedEntityType: "order",
        relatedEntityId: order._id,
      });

      if (txCount === 0) {
        orphanedTransactions.push({
          orderId: String(order._id),
          orderCode: order.orderCode,
          itemCount: (order.items || []).length,
        });
      }

      if (txCount > (order.items || []).length) {
        inconsistencies.push({
          orderId: String(order._id),
          orderCode: order.orderCode,
          expectedTransactions: (order.items || []).length,
          actualTransactions: txCount,
          issue: "duplicate_transactions",
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      orders: {
        total: orderCount,
        missingTransactions: orphanedTransactions.length,
        inconsistent: inconsistencies.length,
      },
      orphanedTransactions,
      inconsistencies,
      synchronized: orphanedTransactions.length === 0 && inconsistencies.length === 0,
    };
  } catch (error) {
    console.error("Failed to verify synchronization:", error);
    return { error: error.message };
  }
};

/**
 * Invalidate cache for specific keys
 */
const invalidateCache = (pattern = null) => {
  if (!pattern) {
    statsCache.clear();
    return { cleared: "all" };
  }

  const keys = Object.keys(statsCache.cache);
  let count = 0;
  for (const key of keys) {
    if (key.includes(pattern)) {
      statsCache.clearKey(key);
      count += 1;
    }
  }

  return { cleared: count, pattern };
};

module.exports = {
  getOrderStats,
  getInventoryStats,
  getTransactionSummary,
  verifySynchronization,
  invalidateCache,
};
