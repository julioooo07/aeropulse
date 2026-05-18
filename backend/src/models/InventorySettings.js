const mongoose = require("mongoose");

const inventorySettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    defaultLowStockThreshold: { type: Number, default: 5, min: 0 },
    defaultCriticalStockThreshold: { type: Number, default: 0, min: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

inventorySettingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("InventorySettings", inventorySettingsSchema);
