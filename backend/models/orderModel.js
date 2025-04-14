import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now() },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentId: { type: String },
    paymentMethod: { type: String, default: 'Cashfree' },
    email: { type: String },
    phone: { type: String }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;