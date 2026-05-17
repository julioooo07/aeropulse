const mongoose = require("mongoose");

const inventoryAlertSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true, index: true },

    isActive: { type: Boolean, default: false, index: true },
    currentStatus: {
      type: String,
      enum: ["normal", "low", "critical", "out"],
      default: "normal",
      index: true,
    },

    firstTriggeredAt: { type: Date, default: null },
    lastCheckedAt: { type: Date, default: null },

    stockAtLastCheck: { type: Number, default: 0 },
    effectiveLowThreshold: { type: Number, default: 0 },
    effectiveCriticalThreshold: { type: Number, default: 0 },

    lastNotifiedAt: { type: Date, default: null },
    lastNotifiedStatus: {
      type: String,
      enum: ["normal", "low", "critical", "out"],
      default: "normal",
    },

    acknowledgedAt: { type: Date, default: null },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    resolvedAt: { type: Date, default: null },
    resolvedReason: { type: String, enum: ["restocked", "acknowledged"], default: null },

    // If acknowledged while still low/critical/out, suppress re-alerts until stock returns to normal.
    suppressUntilNormal: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

inventoryAlertSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("InventoryAlert", inventoryAlertSchema);
