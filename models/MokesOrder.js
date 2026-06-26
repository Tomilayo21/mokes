import mongoose from 'mongoose';

function generateOrderId() {
  const prefix = "MOKÉS-";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomString = [...Array(12)]
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
  return prefix + randomString;
}

const mokesOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: generateOrderId,
  },
  userId: { type: String, required: true, ref: 'user' },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'clothing' },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],

  amount: { type: Number, required: true, min: 0 },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'address', required: true },
  date: { type: Date, required: true, default: Date.now },

  paymentMethod: {
    type: String,
    required: true,
    enum: [
      'stripe',
      'paypal',
      'paystack',
      'apple',
      'google',
      'amazon',
      'bank-transfer',
      'crypto',
      'mpesa',
      'paytm',
      'cash-on-delivery',
    ],
  },

  // 🔹 New gateway-specific IDs
  paymentIntentId: { type: String, index: true }, // Stripe
  referenceId: { type: String, index: true },     // Paystack

  orderStatus: {
    type: String,
    enum: ["Pending", "Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Successful', 'Failed', 'Refunded'],
    default: "Pending"
  },

  proofOfPaymentUrl: { type: String },
  trackingNumber: String,
  shippingCarrier: String,
  shippingLabelUrl: String,
  deliveryStatus: {
    type: String,
    enum: ["Pending", "Shipped", "In Transit", "Delivered", "Cancelled"],
    default: "Pending"
  }
}, { timestamps: true });

const MokesOrder = mongoose.models.MokesOrder || mongoose.model('MokesOrder', mokesOrderSchema);
export default MokesOrder;
