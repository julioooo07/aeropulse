const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const { notifyUsersByRoles } = require("../domain/notificationHelper");

/**
 * Notification synchronization service
 * Ensures notifications are sent and linked to order/inventory changes
 */

const orderStatusMessages = {
  to_pay: {
    title: "Order Received",
    message: (order) =>
      `Your order ${order.orderCode} has been received and is pending approval.`,
  },
  to_deliver: {
    title: "Order Approved",
    message: (order) =>
      `Your order ${order.orderCode} has been approved and is ready for delivery.`,
  },
  to_install: {
    title: "Order Dispatched",
    message: (order) => `Your order ${order.orderCode} is on the way and ready for installation.`,
  },
  complete: {
    title: "Order Completed",
    message: (order) => `Your order ${order.orderCode} has been completed successfully.`,
  },
  cancelled: {
    title: "Order Cancelled",
    message: (order) => `Your order ${order.orderCode} has been cancelled.`,
  },
};

/**
 * Emit notification when order status changes
 */
const notifyOrderStatusChange = async ({ orderId, newStatus, oldStatus, customMessage = null }) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`Order not found for notification: ${orderId}`);
      return null;
    }

    const template = orderStatusMessages[newStatus];
    if (!template) {
      console.warn(`No notification template for status: ${newStatus}`);
      return null;
    }

    const title = template.title;
    const message = customMessage || template.message(order);

    const notification = await Notification.create({
      user: order.customer,
      type: "order",
      title,
      message,
      actionUrl: "/my-orders",
      entityType: "order",
      entityId: order._id,
      status: "unread",
      unread: true,
      metadata: {
        orderCode: order.orderCode,
        statusChange: {
          from: oldStatus,
          to: newStatus,
        },
      },
    });

    // Notify admins/superadmins about order status changes (except customer notifications)
    await notifyUsersByRoles({
      roles: ["admin", "superadmin"],
      title: `Order ${order.orderCode} - ${title}`,
      message: `Order ${order.orderCode} status changed from ${oldStatus} to ${newStatus}`,
      actionUrl: "/admin/orders",
      entityType: "order",
      entityId: order._id,
      type: "order",
    });

    return notification;
  } catch (error) {
    console.error("Failed to notify order status change:", error);
    return null;
  }
};

/**
 * Emit inventory alert when stock falls below threshold
 */
const notifyLowInventory = async ({ product, newStock, threshold, alertType = "low" }) => {
  try {
    if (!product || !product._id) {
      throw new Error("Invalid product");
    }

    const alertTitle =
      alertType === "out"
        ? "Out of Stock Alert"
        : alertType === "critical"
          ? "Critical Stock Alert"
          : "Low Stock Alert";

    const alertMessage = `${product.name} ${product.specs || ""} is ${
      alertType === "out" ? "out of stock" : alertType === "critical" ? "critically low" : "low"
    } (${newStock} remaining)`;

    const created = await notifyUsersByRoles({
      roles: ["admin", "superadmin"],
      title: alertTitle,
      message: alertMessage,
      actionUrl: "/admin/inventory",
      entityType: "product",
      entityId: String(product._id),
      type: "system",
      metadata: {
        alertType,
        currentStock: newStock,
        threshold,
      },
    });

    return { notified: created > 0, count: created };
  } catch (error) {
    console.error("Failed to notify low inventory:", error);
    return { notified: false, count: 0 };
  }
};

/**
 * Mark order notifications as read when customer views order
 */
const markOrderNotificationsAsRead = async (orderId, userId) => {
  try {
    const result = await Notification.updateMany(
      {
        user: userId,
        entityType: "order",
        entityId: orderId,
        unread: true,
      },
      {
        unread: false,
        status: "read",
        readAt: new Date(),
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return false;
  }
};

/**
 * Clean up old notifications (older than 90 days)
 */
const cleanupOldNotifications = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      status: "read",
      createdAt: { $lt: cutoffDate },
    });

    return {
      deleted: result.deletedCount,
      reason: `Notifications older than ${daysOld} days`,
    };
  } catch (error) {
    console.error("Failed to cleanup notifications:", error);
    return { deleted: 0, error: error.message };
  }
};

/**
 * Get notification summary for user
 */
const getUserNotificationSummary = async (userId) => {
  try {
    const [unread, total, byType] = await Promise.all([
      Notification.countDocuments({
        user: userId,
        unread: true,
      }),
      Notification.countDocuments({
        user: userId,
      }),
      Notification.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    const typeMap = {};
    for (const item of byType) {
      typeMap[item._id] = item.count;
    }

    return {
      userId: String(userId),
      unread,
      total,
      byType: typeMap,
    };
  } catch (error) {
    console.error("Failed to get notification summary:", error);
    return { error: error.message };
  }
};

module.exports = {
  notifyOrderStatusChange,
  notifyLowInventory,
  markOrderNotificationsAsRead,
  cleanupOldNotifications,
  getUserNotificationSummary,
};
