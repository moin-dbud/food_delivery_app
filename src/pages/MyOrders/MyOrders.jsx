import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user orders
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${url}/api/order/user-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          toast.error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error loading your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, url, navigate]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'status-success';
      case 'PENDING':
        return 'status-pending';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="my-orders">
      <h1>My Orders</h1>
      
      {loading ? (
        <div className="loading-container">
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')}>Browse Menu</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span>Order ID:</span> {order.id}
                </div>
                <div className="order-date">
                  <span>Date:</span> {formatDate(order.created_at)}
                </div>
                <div className={`order-status ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="order-items">
                {JSON.parse(order.items).map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-name">
                      {item.name} <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <div className="item-price">₹{item.price}</div>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span> ₹{order.amount}
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
