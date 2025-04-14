import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// placing user order from frontend
const placeOrder = async (req, res) => {
    try {
        // Log the entire request body for debugging
        console.log("Place Order Request:", JSON.stringify(req.body, null, 2));
        
        const { userId, items, amount, address, email, phone } = req.body;
        
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for order"
            });
        }
        
        // Create new order document
        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            email: email || '',
            phone: phone || '',
            paymentMethod: 'Google Form',
            paymentStatus: 'pending',
            status: "Food Processing"
        });
        
        // Save the order to the database
        const savedOrder = await newOrder.save();
        console.log("Order saved:", savedOrder._id);
        
        // Clear user's cart
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            orderId: savedOrder._id
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create order: " + error.message
        });
    }
};



// user orders for frontend
const userOrders = async (req, res) => {
    try {
        console.log("Fetching orders for user:", req.body.userId);
        
        if (!req.body.userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }
        
        const orders = await orderModel.find({ userId: req.body.userId })
            .sort({ date: -1 }); // Most recent first
            
        console.log(`Found ${orders.length} orders for user ${req.body.userId}`);
        
        return res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("User Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving orders: " + error.message
        });
    }
};

// listing order for admin panel
const listOrders = async (req, res) => {
    try {
        console.log("Fetching all orders");
        
        const orders = await orderModel.find({})
            .sort({ date: -1 }); // Most recent first
            
        console.log(`Found ${orders.length} total orders`);
        
        return res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("List Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving orders: " + error.message
        });
    }
};

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: "Order ID and status are required"
            });
        }
        
        console.log(`Updating order ${orderId} status to: ${status}`);
        
        const updated = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        return res.json({
            success: true,
            message: "Status updated successfully",
            order: updated
        });
    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating status: " + error.message
        });
    }
};

// Create order by admin
const createOrderByAdmin = async (req, res) => {
    try {
        console.log("Admin Create Order Request:", JSON.stringify(req.body, null, 2));
        
        const { userId, items, amount, address, email, phone, paymentStatus } = req.body;
        
        if (!items || !amount || !address) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for order"
            });
        }
        
        // Create new order document
        const newOrder = new orderModel({
            userId: userId || "guest", // Use "guest" if no userId provided
            items,
            amount,
            address,
            email: email || '',
            phone: phone || '',
            paymentMethod: 'Manual Entry',
            paymentStatus: paymentStatus || 'pending',
            status: "Food Processing"
        });
        
        // Save the order to the database
        const savedOrder = await newOrder.save();
        console.log("Order created by admin:", savedOrder._id);
        
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            orderId: savedOrder._id
        });
    } catch (error) {
        console.error("Admin Order Creation Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create order: " + error.message
        });
    }
};



// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId, paymentStatus } = req.body;
        
        if (!orderId || !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: "Order ID and payment status are required"
            });
        }
        
        console.log(`Updating order ${orderId} payment status to: ${paymentStatus}`);
        
        const updated = await orderModel.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        );
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        return res.json({
            success: true,
            message: "Payment status updated successfully",
            order: updated
        });
    } catch (error) {
        console.error("Update Payment Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating payment status: " + error.message
        });
    }
};

export { placeOrder, userOrders, listOrders, updateStatus, updatePaymentStatus, createOrderByAdmin };
