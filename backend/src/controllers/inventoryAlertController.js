const InventoryAlert = require("../models/InventoryAlert");
const InventorySettings = require("../models/InventorySettings");

const SETTINGS_KEY = "default";

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

const getSettings = async (_req, res) => {
  const settings = await getOrCreateSettings();
  return res.json({ settings: settings.toJSON() });
};

const updateSettings = async (req, res) => {
  const { defaultLowStockThreshold, defaultCriticalStockThreshold } = req.body || {};

  const update = { updatedBy: req.authUser._id };

  if (defaultLowStockThreshold !== undefined) {
    const value = Number(defaultLowStockThreshold);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({ message: "defaultLowStockThreshold must be a number >= 0" });
    }
    update.defaultLowStockThreshold = Math.floor(value);
  }

  if (defaultCriticalStockThreshold !== undefined) {
    const value = Number(defaultCriticalStockThreshold);
    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({ message: "defaultCriticalStockThreshold must be a number >= 0" });
    }
    update.defaultCriticalStockThreshold = Math.floor(value);
  }

  const settings = await InventorySettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: update, $setOnInsert: { key: SETTINGS_KEY } },
    { upsert: true, new: true }
  );

  return res.json({ settings: settings.toJSON() });
};

const listAlerts = async (req, res) => {
  const {
    activeOnly = "true",
    status,
    includeSuppressed = "false",
  } = req.query || {};

  const query = {};
  const onlyActive = String(activeOnly).toLowerCase() !== "false";
  if (onlyActive) query.isActive = true;

  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";
  if (normalizedStatus && ["normal", "low", "critical", "out"].includes(normalizedStatus)) {
    query.currentStatus = normalizedStatus;
  }

  const includeSupp = String(includeSuppressed).toLowerCase() === "true";
  if (!includeSupp && !onlyActive) {
    // If requesting non-active alerts but not suppressed ones, hide suppressed alerts.
    query.suppressUntilNormal = { $ne: true };
  }

  const alerts = await InventoryAlert.find(query)
    .populate("product", "name sku specs stock threshold isActive")
    .populate("acknowledgedBy", "name email role")
    .sort({ isActive: -1, updatedAt: -1 })
    .limit(200);

  return res.json({ alerts: alerts.map((a) => a.toJSON()) });
};

const acknowledgeAlert = async (req, res) => {
  const { id } = req.params;
  const now = new Date();

  const alert = await InventoryAlert.findById(id);
  if (!alert) {
    return res.status(404).json({ message: "Alert not found" });
  }

  alert.isActive = false;
  alert.acknowledgedAt = now;
  alert.acknowledgedBy = req.authUser._id;
  alert.resolvedAt = now;
  alert.resolvedReason = "acknowledged";
  alert.suppressUntilNormal = true;
  await alert.save();

  return res.json({ alert: alert.toJSON() });
};

module.exports = {
  getSettings,
  updateSettings,
  listAlerts,
  acknowledgeAlert,
};
