import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext.jsx";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Razorpay key from environment variable
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  // Create order and initiate Razorpay payment
  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again in a moment.");
      setLoading(false);
      return;
    }

    try {
      // Prepare order items
      const orderItems = food_list
        .filter(item => cartItems[item._id] > 0)
        .map(item => ({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
          category: item.category,
          imageUrl: item.image,
          description: item.description
        }));

      if (orderItems.length === 0) {
        toast.error("Your cart is empty!");
        setLoading(false);
        return;
      }

      // Prepare the complete address
      const address = {
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        country: data.country
      };

      const totalAmount = getTotalCartAmount() + 26; // Adding delivery fee

      const orderData = {
        userId: token, // Assuming token contains user ID
        items: orderItems,
        amount: totalAmount,
        address: address,
        email: data.email,
        phone: data.phone
      };

      // Create order in your system first
      const response = await axios.post(`${url}/api/order/create-order`, orderData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Initiate Razorpay payment with the order data
        initiateRazorpayPayment(response.data.order);
      } else {
        toast.error(response.data.message || "Failed to create order");
        setLoading(false);
      }
    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
      setLoading(false);
    }
  };

  const initiateRazorpayPayment = (order) => {
    if (!window.Razorpay) {
      toast.error("Payment system is not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount * 100, // Amount in paise
      currency: "INR",
      name: "Food Delivery",
      description: "Food order payment",
      order_id: order.razorpayOrderId,
      handler: (response) => verifyPaymentHandler(response, order._id),
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phone,
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: () => {
          setLoading(false);
          deleteOrderHandler(order._id);
        }
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to launch payment interface. Please try again.");
      setLoading(false);
    }
  };

  const verifyPaymentHandler = async (razorpayResponse, orderId) => {
    try {
      const paymentData = {
        orderId: orderId,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      };

      const response = await axios.post(`${url}/api/order/verify-payment`, paymentData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success("Payment successful!");
        await clearCart();
        navigate("/my-orders");
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrderHandler = async (orderId) => {
    try {
      await axios.delete(`${url}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Delete order error:", error);
    }
  };

  const clearCart = async () => {
    try {
      // Clear cart in your backend
      await axios.delete(`${url}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear cart in the frontend context
      setCartItems({});
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Error while clearing the cart.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/cart');
    }
    else if(getTotalCartAmount() === 0) {
      navigate('/cart');
    }
    
    // Load Razorpay script
    const loadRazorpayScript = () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        setRazorpayLoaded(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        console.log("Razorpay script loaded successfully");
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
      };
      document.body.appendChild(script);
    };
    
    loadRazorpayScript();
    
    // Cleanup
    return () => {
      // We don't remove the script on unmount to avoid reloading it if the user navigates back
    };
  }, [token, getTotalCartAmount, navigate]);

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 26 : 0;
  const total = subtotal + deliveryFee;

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder="First Name" />
          <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder="Last Name" />
        </div>
        <input required name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Email address" />
        <input required name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder="Street" />
        <div className="multi-fields">
          <input required name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder="City" />
          <input required name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder="State" />
        </div>
        <div className="multi-fields">
          <input required name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder="Zip Code" />
          <input required name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder="Country" />
        </div>
        <input 
          required 
          name="phone" 
          onChange={onChangeHandler} 
          value={data.phone} 
          type="tel" 
          placeholder="Phone"
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit phone number"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{total}</b>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || subtotal === 0 || !razorpayLoaded}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Processing...' : 'PROCEED TO PAYMENT'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
