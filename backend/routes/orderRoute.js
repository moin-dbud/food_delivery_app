import express from "express";
import authMiddleware from "../middleware/auth.js";
import { 
    placeOrder, 
    userOrders, 
    listOrders, 
    updateStatus,
    updatePaymentStatus,
    createOrderByAdmin
} from "../controller/orderController.js";

const orderRouter = express.Router();

// Place a new order
orderRouter.post("/place", authMiddleware, placeOrder);

// Get user's orders
orderRouter.post("/userorders", authMiddleware, userOrders);

// List all orders (admin)
orderRouter.get("/list", listOrders);

// Update order status
orderRouter.post("/status", updateStatus);

// Update payment status
orderRouter.post("/payment-status", updatePaymentStatus);

// Create order from admin panel (new endpoint)
orderRouter.post("/create-admin", createOrderByAdmin);

export default orderRouter;