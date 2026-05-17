const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotification = async ({
  userId,
  type = "system",
  title,
  message,
  actionUrl = "",
  entityType = "",
  entityId = "",
  metadata = {},
  unread = true,
  status = "unread",
}) => {
  if (!userId || !title || !message) return null;

  const user = await User.findById(userId).select("notifications");
  if (!user) return null;

  const notificationsPrefs = user.notifications?.toObject?.() || user.notifications || {};
  if (notificationsPrefs.inApp === false) return null;
  if (type === "account" && notificationsPrefs.accountUpdates === false) return null;
  if (type === "order" && notificationsPrefs.orderUpdates === false) return null;
  if (type === "system" && notificationsPrefs.systemAlerts === false) return null;

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    actionUrl,
    entityType,
    entityId,
    metadata,
    unread,
    status,
  });
};

const notifyUsersByRoles = async ({
  roles,
  title,
  message,
  actionUrl = "",
  entityType = "",
  entityId = "",
  type = "system",
  metadata = {},
}) => {
  if (!Array.isArray(roles) || roles.length === 0) return 0;

  const users = await User.find({
    role: { $in: roles },
    isDeleted: false,
    accountStatus: "active",
  }).select("notifications");

  const notifications = [];
  users.forEach((user) => {
    const notificationsPrefs = user.notifications?.toObject?.() || user.notifications || {};
    if (notificationsPrefs.inApp === false) return;
    if (type === "account" && notificationsPrefs.accountUpdates === false) return;
    if (type === "order" && notificationsPrefs.orderUpdates === false) return;
    if (type === "system" && notificationsPrefs.systemAlerts === false) return;

    notifications.push({
      user: user._id,
      type,
      title,
      message,
      actionUrl,
      entityType,
      entityId,
      metadata,
      unread: true,
      status: "unread",
    });
  });

  if (notifications.length === 0) return 0;
  await Notification.insertMany(notifications);
  return notifications.length;
};

module.exports = {
  createNotification,
  notifyUsersByRoles,
};
