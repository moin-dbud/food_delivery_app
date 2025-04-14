import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      toast.error("Please login to view your orders");
      navigate('/login');
      return;
    }

    // Function to fetch user orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching orders for user with token", token);
        
        const response = await axios.post(
          `${url}/api/order/userorders`, 
          { userId: token },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("User orders response:", response.data);

        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error loading your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, url, navigate]);

  // Format date function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="my-orders-loading">Loading your orders...</div>;
  }

  return (
    <div className="my-orders">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>We are fetching your orders once you place the order you will get the email confirmation <br /> You will get all the info about your order in the email
          </p>
          <button onClick={() => navigate('/#explore-menu')}>Browse Menu</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order ID: {order._id.substring(0, 8)}</span>
                <span className="order-date">{formatDate(order.date)}</span>
              </div>
              
              <div className="order-items">
                <h3>Order Items</h3>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="order-address">
                <h3>Delivery Address</h3>
                <p>{order.address.firstName} {order.address.lastName}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                <p>{order.address.country}</p>
                <p>Phone: {order.address.phone}</p>
              </div>
              
              <div className="order-status-section">
                <div className="status-item">
                  <span className="status-label">Order Status:</span>
                  <span className={`status-value order-status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">Payment Status:</span>
                  <span className={`status-value payment-status-${order.paymentStatus}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="order-footer">
                <div className="order-amount">
                  <span className="amount-label">Total Amount:</span>
                  <span className="amount-value">₹{order.amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;