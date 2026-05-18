const InventorySettings = require("../models/InventorySettings");
const InventoryAlert = require("../models/InventoryAlert");
const Product = require("../models/Product");
const { notifyUsersByRoles } = require("./notificationHelper");

const SETTINGS_KEY = "default";

const severityRank = (status) => {
  if (status === "out") return 3;
  if (status === "critical") return 2;
  if (status === "low") return 1;
  return 0;
};

const getOrCreateSettings = async () => InventorySettings.findOneAndUpdate(
  { key: SETTINGS_KEY },
  {
    $setOnInsert: {
      key: SETTINGS_KEY,
      defaultLowStockThreshold: 5,
      defaultCriticalStockThreshold: 0,
    },
  },
  { upsert: true, new: true }
);

const computeCriticalThreshold = ({ lowThreshold, criticalOverride }) => {
  const low = Math.max(0, Number(lowThreshold) || 0);
  const override = Math.max(0, Number(criticalOverride) || 0);
  if (low <= 0) return 0;

  if (override > 0) {
    // Keep critical strictly below low to preserve distinct statuses.
    return Math.min(override, Math.max(0, low - 1));
  }

  // Simple default: critical is half of low threshold.
  return Math.max(1, Math.floor(low / 2));
};

const computeInventoryStatus = ({ stock, lowThreshold, criticalThreshold }) => {
  const current = Number(stock) || 0;
  const low = Math.max(0, Number(lowThreshold) || 0);
  const critical = Math.max(0, Number(criticalThreshold) || 0);

  if (current <= 0) return "out";
  if (low <= 0) return "normal";

  if (current < low) {
    if (critical > 0 && current <= critical) return "critical";
    return "low";
  }
  return "normal";
};

const productDisplayName = (product) => {
  const name = String(product?.name || "").trim();
  const specs = String(product?.specs || "").trim();
  return specs ? `${name} ${specs}` : name;
};

const buildNotificationText = ({ status, product }) => {
  const display = productDisplayName(product);
  if (status === "out") return `Out of stock alert for ${display}`;
  if (status === "critical") return `Critical stock alert for ${display}`;
  return `Low stock alert for ${display}`;
};

const notifySuperAdmins = async ({ status, product }) => {
  const message = buildNotificationText({ status, product });
  const title = status === "out" ? "Out of stock alert" : (status === "critical" ? "Critical stock alert" : "Low stock alert");

  const notifiedCount = await notifyUsersByRoles({
    roles: ["superadmin"],
    title,
    message,
    actionUrl: "/superadmin/inventory",
    entityType: "product",
    entityId: String(product._id),
    type: "system",
  });

  return { notifiedCount };
};

const updateAlertForProduct = async ({ product, settings, now }) => {
  const stock = Number(product.stock || 0);
  const lowThreshold = Number(product.threshold || 0) > 0
    ? Number(product.threshold || 0)
    : Number(settings.defaultLowStockThreshold || 0);
  const criticalThreshold = computeCriticalThreshold({
    lowThreshold,
    criticalOverride: settings.defaultCriticalStockThreshold,
  });

  const status = computeInventoryStatus({
    stock,
    lowThreshold,
    criticalThreshold,
  });

  let alert = await InventoryAlert.findOne({ product: product._id });

  // Avoid creating an alert doc for normal products.
  if (!alert && status === "normal") {
    return { status, notified: false };
  }

  if (!alert) {
    await notifySuperAdmins({ status, product });
    alert = await InventoryAlert.create({
      product: product._id,
      isActive: true,
      currentStatus: status,
      firstTriggeredAt: now,
      lastCheckedAt: now,
      stockAtLastCheck: stock,
      effectiveLowThreshold: lowThreshold,
      effectiveCriticalThreshold: criticalThreshold,
      lastNotifiedAt: now,
      lastNotifiedStatus: status,
      suppressUntilNormal: false,
    });
    return { status, notified: true };
  }

  // Clear suppression once the product returns to normal.
  if (status === "normal" && alert.suppressUntilNormal) {
    alert.suppressUntilNormal = false;
  }

  // If alert is currently suppressed (acknowledged while still low), keep updating state but do not re-trigger.
  const isSuppressed = Boolean(alert.suppressUntilNormal) && !alert.isActive;
  if (isSuppressed && status !== "normal") {
    alert.currentStatus = status;
    alert.lastCheckedAt = now;
    alert.stockAtLastCheck = stock;
    alert.effectiveLowThreshold = lowThreshold;
    alert.effectiveCriticalThreshold = criticalThreshold;
    await alert.save();
    return { status, notified: false, suppressed: true };
  }

  // Transition to normal: resolve any active alert.
  if (status === "normal") {
    alert.currentStatus = "normal";
    alert.lastCheckedAt = now;
    alert.stockAtLastCheck = stock;
    alert.effectiveLowThreshold = lowThreshold;
    alert.effectiveCriticalThreshold = criticalThreshold;

    if (alert.isActive) {
      alert.isActive = false;
      alert.resolvedAt = now;
      alert.resolvedReason = "restocked";
    }
    await alert.save();
    return { status, notified: false };
  }

  // Trigger / escalate.
  const wasActive = Boolean(alert.isActive);
  const previousNotified = String(alert.lastNotifiedStatus || "normal");
  const shouldNotify = !wasActive || severityRank(status) > severityRank(previousNotified);

  alert.isActive = true;
  alert.currentStatus = status;
  alert.lastCheckedAt = now;
  alert.stockAtLastCheck = stock;
  alert.effectiveLowThreshold = lowThreshold;
  alert.effectiveCriticalThreshold = criticalThreshold;

  // If we are re-triggering after being normal, reset acknowledgement fields.
  if (!wasActive) {
    alert.firstTriggeredAt = now;
    alert.acknowledgedAt = null;
    alert.acknowledgedBy = undefined;
    alert.resolvedAt = null;
    alert.resolvedReason = null;
  }

  let notified = false;
  if (shouldNotify) {
    await notifySuperAdmins({ status, product });
    alert.lastNotifiedAt = now;
    alert.lastNotifiedStatus = status;
    notified = true;
  }

  await alert.save();
  return { status, notified };
};

const runInventoryCheckOnce = async () => {
  const now = new Date();
  const settings = await getOrCreateSettings();
  const products = await Product.find({ isActive: true }).select("name specs sku stock threshold isActive");

  let notifiedCount = 0;
  const counts = { normal: 0, low: 0, critical: 0, out: 0 };

  for (const product of products) {
    // eslint-disable-next-line no-await-in-loop
    const result = await updateAlertForProduct({ product, settings, now });
    counts[result.status] = Number(counts[result.status] || 0) + 1;
    if (result.notified) notifiedCount += 1;
  }

  return {
    checkedAt: now,
    productsChecked: products.length,
    statusCounts: counts,
    productsNotified: notifiedCount,
    settings: settings.toJSON(),
  };
};

const startInventoryMonitor = ({ intervalMs = 60_000 } = {}) => {
  const enabled = String(process.env.INVENTORY_MONITOR_ENABLED || "true").toLowerCase() !== "false";
  const effectiveInterval = Math.max(10_000, Number(intervalMs) || 60_000);
  if (!enabled) {
    console.log("Inventory monitor disabled (INVENTORY_MONITOR_ENABLED=false)");
    return { stop: () => null };
  }

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await runInventoryCheckOnce();
    } catch (e) {
      console.error("Inventory monitor tick failed:", e);
    } finally {
      running = false;
    }
  };

  // Run once immediately, then periodically.
  tick();
  const timer = setInterval(tick, effectiveInterval);
  timer.unref?.();

  console.log(`Inventory monitor started (every ${effectiveInterval}ms)`);
  return { stop: () => clearInterval(timer) };
};

module.exports = {
  startInventoryMonitor,
  runInventoryCheckOnce,
  computeInventoryStatus,
  computeCriticalThreshold,
};
