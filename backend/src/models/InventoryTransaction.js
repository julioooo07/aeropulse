const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: [
        "stock_addition",
        "stock_deduction",
        "stock_adjustment",
        "restock_receipt",
        "order_deduction",
      ],
      index: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    branch: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    referenceType: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    relatedEntityType: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    restockOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestockOrder",
      default: null,
      index: true,
    },
    trackingNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    deliveryCompany: {
      type: String,
      default: "",
      trim: true,
    },
    deliveredBy: {
      type: String,
      default: "",
      trim: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveryDate: {
      type: Date,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    supplierName: {
      type: String,
      default: "",
      trim: true,
    },
    productName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

inventoryTransactionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);
