import React, { useState, useEffect } from 'react';
import './Orders.css';
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from '../../assets/assets';
import CreateOrder from '../CreatOrder/CreatOrder';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    orderStatus: 'all',
    searchTerm: ''
  });

  // Fetch orders with improved error handling
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!url) {
        const errorMsg = "API URL is not defined";
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }
      
      const apiUrl = `${url}/api/order/list`;
      console.log("Fetching orders from:", apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Orders API response:", response);
      
      if (response.data && response.data.success) {
        const orderData = response.data.data || [];
        console.log("Parsed order data:", orderData);
        
        if (Array.isArray(orderData)) {
          setOrders(orderData);
          applyFilters(orderData); // Apply filters to new data
          console.log(`Successfully loaded ${orderData.length} orders`);
        } else {
          console.error("API returned non-array data for orders:", orderData);
          setError("Invalid data format received from server");
        }
      } else {
        const errorMsg = response.data?.message || "Failed to fetch orders";
        console.error("API error:", errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      let errorMsg = "Failed to load orders. ";
      
      if (error.response) {
        errorMsg += `Server error: ${error.response.status}`;
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        errorMsg += "No response from server. Check network connection.";
      } else {
        errorMsg += error.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to orders
  const applyFilters = (orderData = orders) => {
    let result = [...orderData];
    
    // Filter by payment status
    if (filters.paymentStatus !== 'all') {
      result = result.filter(order => order.paymentStatus === filters.paymentStatus);
    }
    
    // Filter by order status
    if (filters.orderStatus !== 'all') {
      result = result.filter(order => order.status === filters.orderStatus);
    }
    
    // Filter by search term (customer name, order ID, etc.)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(order => 
        (order._id && order._id.toLowerCase().includes(searchLower)) ||
        (order.address?.firstName && order.address.firstName.toLowerCase().includes(searchLower)) ||
        (order.address?.lastName && order.address.lastName.toLowerCase().includes(searchLower)) ||
        (order.email && order.email.toLowerCase().includes(searchLower)) ||
        (order.phone && order.phone.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredOrders(result);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    // Apply new filters to existing orders
    let result = [...orders];
    
    // Filter by payment status
    if (newFilters.paymentStatus !== 'all') {
      result = result.filter(order => order.paymentStatus === newFilters.paymentStatus);
    }
    
    // Filter by order status
    if (newFilters.orderStatus !== 'all') {
      result = result.filter(order => order.status === newFilters.orderStatus);
    }
    
    // Filter by search term
    if (newFilters.searchTerm) {
      const searchLower = newFilters.searchTerm.toLowerCase();
      result = result.filter(order => 
        (order._id && order._id.toLowerCase().includes(searchLower)) ||
        (order.address?.firstName && order.address.firstName.toLowerCase().includes(searchLower)) ||
        (order.address?.lastName && order.address.lastName.toLowerCase().includes(searchLower)) ||
        (order.email && order.email.toLowerCase().includes(searchLower)) ||
        (order.phone && order.phone.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredOrders(result);
  };

  const statusHandler = async (event, orderId) => {
    try {
      const status = event.target.value;
      console.log(`Updating order ${orderId} status to ${status}`);
      
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status
      });
      
      if (response.data.success) {
        toast.success("Order status updated");
        triggerRefresh();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  const paymentStatusHandler = async (event, orderId) => {
    try {
      const paymentStatus = event.target.value;
      console.log(`Updating order ${orderId} payment status to ${paymentStatus}`);
      
      const response = await axios.post(`${url}/api/order/payment-status`, {
        orderId,
        paymentStatus
      });
      
      if (response.data.success) {
        toast.success("Payment status updated");
        triggerRefresh();
      } else {
        toast.error(response.data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  // Function to trigger a refresh
  const triggerRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const handleOrderCreated = () => {
    triggerRefresh();
    toast.success("Order created! Refreshing order list...");
  };

  // First load and refresh when dependencies change
  useEffect(() => {
    if (url) {
      fetchAllOrders();
    }
  }, [url, refreshCounter]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Render filter panel
  const renderFilterPanel = () => (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="filter-group">
          <label>Payment Status</label>
          <select 
            value={filters.paymentStatus} 
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending Payment</option>
            <option value="completed">Payment Completed</option>
            <option value="failed">Payment Failed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Order Status</label>
          <select 
            value={filters.orderStatus} 
            onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
          >
            <option value="all">All Order Statuses</option>
            <option value="Food Processing">Food Processing</option>
            <option value="Out for delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name, order ID..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </div>
      
      <div className="filter-stats">
        <div className="stat-badge all">
          All: {orders.length}
        </div>
        <div className="stat-badge pending">
          Pending Payment: {orders.filter(o => o.paymentStatus === 'pending').length}
        </div>
        <div className="stat-badge completed">
          Completed Payment: {orders.filter(o => o.paymentStatus === 'completed').length}
        </div>
        <div className="stat-badge processing">
          Processing: {orders.filter(o => o.status === 'Food Processing').length}
        </div>
        <div className="stat-badge delivery">
          Out for Delivery: {orders.filter(o => o.status === 'Out for delivery').length}
        </div>
        <div className="stat-badge delivered">
          Delivered: {orders.filter(o => o.status === 'Delivered').length}
        </div>
      </div>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className="orders-loading">
      <div className="spinner"></div>
      <p>Loading orders...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="order-error">
      <h3>Error Loading Orders</h3>
      <p>{error}</p>
      <button onClick={triggerRefresh} className="retry-button">Try Again</button>
    </div>
  );

  // Render no orders state
  const renderNoOrders = () => (
    <div className="no-orders">
      <p>No orders found. {filters.paymentStatus !== 'all' || filters.orderStatus !== 'all' || filters.searchTerm ? 'Try changing filters.' : 'Create a new order to get started.'}</p>
      {(filters.paymentStatus !== 'all' || filters.orderStatus !== 'all' || filters.searchTerm) && (
        <button onClick={() => setFilters({ paymentStatus: 'all', orderStatus: 'all', searchTerm: '' })} className="clear-filters-btn">
          Clear Filters
        </button>
      )}
    </div>
  );

  // Render orders list
  const renderOrdersList = () => (
    <div className="order-list">
      {filteredOrders.map((order, index) => (
        <div key={order._id || `order-${index}`} className="order-card">
          <div className="order-card-header">
            <div className="order-id">Order #{order._id ? order._id.substring(0, 8) : index}</div>
            <div className="order-date">{order.date ? new Date(order.date).toLocaleString() : 'No date'}</div>
          </div>
          
          <div className="order-card-content">
            <div className="order-customer">
              <h4>Customer</h4>
              <p><strong>{order.address?.firstName || 'N/A'} {order.address?.lastName || ''}</strong></p>
              <p>{order.email || 'No email'}</p>
              <p>{order.phone || 'No phone'}</p>
              <div className="address">
                <p>{order.address?.street || 'No street'}</p>
                <p>
                  {order.address?.city || 'No city'}, 
                  {order.address?.state || 'No state'} 
                  {order.address?.zipcode || 'No zipcode'}
                </p>
                <p>{order.address?.country || 'No country'}</p>
              </div>
            </div>
            
            <div className="order-items-list">
              <h4>Items ({order.items?.length || 0})</h4>
              {order.items && order.items.length > 0 ? (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name || 'Unknown Item'}</td>
                        <td>{item.quantity || 0}</td>
                        <td>₹{item.price || 0}</td>
                        <td>₹{(item.price || 0) * (item.quantity || 0)}</td>
                      </tr>
                    ))}
                    <tr className="delivery-fee">
                      <td colSpan="3">Delivery Fee</td>
                      <td>₹26</td>
                    </tr>
                    <tr className="order-total">
                      <td colSpan="3"><strong>Total</strong></td>
                      <td><strong>₹{order.amount || 0}</strong></td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="no-items">No items in this order</p>
              )}
            </div>
            
            <div className="order-actions">
              <div className="status-control">
                <label>Order Status</label>
                <select 
                  onChange={(event) => statusHandler(event, order._id)} 
                  value={order.status || "Food Processing"}
                  className={`status-${(order.status || "Food Processing").toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              
              <div className="status-control">
                <label>Payment Status</label>
                <select 
                  onChange={(event) => paymentStatusHandler(event, order._id)} 
                  value={order.paymentStatus || "pending"}
                  className={`payment-status-${order.paymentStatus || "pending"}`}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className='order-management'>
      <div className="order-header">
        <h3>Order Management</h3>
        <div className="header-actions">
          <button 
            className="create-order-toggle" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? "Hide Order Form" : "+ Create New Order"}
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <CreateOrder url={url} onOrderCreated={handleOrderCreated} />
      )}
      
      <div className="orders-container">
        <div className="orders-header">
          <h3 className="section-title">All Orders ({orders.length})</h3>
          <button onClick={triggerRefresh} className="refresh-button">
            Refresh Orders
          </button>
        </div>
        
        {/* Filter Panel */}
        {renderFilterPanel()}
        
        {/* Order List with Conditional Rendering */}
        {loading ? renderLoading() : 
         error ? renderError() :
         filteredOrders.length === 0 ? renderNoOrders() : 
         renderOrdersList()}
      </div>
    </div>
  );
};

export default Orders;