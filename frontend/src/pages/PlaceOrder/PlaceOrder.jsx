import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext.jsx";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
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

  // Function to clear the cart
  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem('cartItems'); // Also clear from localStorage if you're using it
    console.log("Cart cleared successfully");
  };

  // Handle Google Form redirection with cart clearing
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Check if cart is empty
    if (getTotalCartAmount() === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Form validation (all fields are required due to required attribute)
    
    try {
      // Store order info in localStorage for potential future reference
      const orderItems = food_list
        .filter(item => cartItems[item._id] > 0)
        .map(item => ({
          ...item,
          quantity: cartItems[item._id]
        }));
        
      const orderSummary = {
        customer: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        address: `${data.street}, ${data.city}, ${data.state}, ${data.country}, ${data.zipcode}`,
        items: orderItems,
        total: getTotalCartAmount() + 26,
        userId: token,
        date: new Date().toISOString()
      };
      
      localStorage.setItem('lastOrderSummary', JSON.stringify(orderSummary));
      
      // Clear the cart before redirecting
      clearCart();
      
      // Show success message
      toast.success("Order submitted! Redirecting to payment form...");
      
      // Redirect to Google Form
      setTimeout(() => {
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSe_ddTlOlxHd5jBrbtEevdpc0BADGWXWfke6tWRuQk6cwejJQ/viewform?usp=dialog";
      }, 1000); // Short delay to allow the toast message to be seen
      
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/cart');
    }
    else if(getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? 26 : 0;
  const total = subtotal + deliveryFee;

  return (
    <form onSubmit={handleSubmit} className="place-order">
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
            disabled={subtotal === 0}
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