const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "shipped", "delivered", "cancelled"], default: "pending" },
  deliveryType: { type: String, enum: ["Express", "Normal"], default: "Normal" },
  deliveryStatus: { type: String, enum: ["Pending", "Shipped", "Delivered"], default: "Pending" },
  deliveryTimestamps: {
    shippedAt: { type: Date },
    deliveredAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema); 