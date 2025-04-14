import React, { useState, useEffect } from 'react';
import '../CreatOrder/CreatOrder.css';
import { toast } from "react-toastify";
import axios from "axios";

const CreateOrder = ({ url, onOrderCreated }) => {
  const [loading, setLoading] = useState(false);
  const [foodList, setFoodList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [orderData, setOrderData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    paymentStatus: "pending"
  });

  // Fetch food items for selection
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get(`${url}/api/food/list`);
        if (response.data.success) {
          setFoodList(response.data.data || []);
        } else {
          console.error("Error in food list response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching food items:", error);
      }
    };

    fetchFoodItems();
  }, [url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { foodId: "", name: "", price: 0, quantity: 1 }]);
  };

  const removeItem = (index) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    
    if (field === 'foodId' && value) {
      const selectedFood = foodList.find(food => food._id === value);
      if (selectedFood) {
        newItems[index] = {
          ...newItems[index],
          foodId: selectedFood._id,
          name: selectedFood.name,
          price: selectedFood.price,
          category: selectedFood.category || "",
          imageUrl: selectedFood.image || "",
          description: selectedFood.description || ""
        };
      }
    } else {
      newItems[index][field] = field === 'quantity' ? parseInt(value) : value;
    }
    
    setSelectedItems(newItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0) + 26; // Add delivery fee
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedItems.length === 0) {
        toast.error("Please add at least one item to the order");
        setLoading(false);
        return;
      }

      // Prepare order data
      const orderPayload = {
        userId: orderData.userId || "guest",
        items: selectedItems,
        amount: calculateTotal(),
        address: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          street: orderData.street,
          city: orderData.city,
          state: orderData.state,
          zipcode: orderData.zipcode,
          country: orderData.country,
          phone: orderData.phone
        },
        email: orderData.email,
        phone: orderData.phone,
        paymentStatus: orderData.paymentStatus
      };

      console.log("Sending order payload:", orderPayload);

      // Create order
      const response = await axios.post(`${url}/api/order/create-admin`, orderPayload);

      if (response.data.success) {
        toast.success("Order created successfully");
        
        // Reset form
        setOrderData({
          userId: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipcode: "",
          country: "",
          paymentStatus: "pending"
        });
        setSelectedItems([]);
        
        // Notify parent component
        if (onOrderCreated) {
          onOrderCreated();
        }
      } else {
        toast.error(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Create order error:", error);
      toast.error("Error creating order: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  


  // Simple manual entry if no food items are fetched
  const handleManualItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = field === 'quantity' || field === 'price' 
      ? parseFloat(value) 
      : value;
    setSelectedItems(newItems);
  };

  return (
    <div className="create-order">
      <h2>Create New Order</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Customer Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>User ID (Optional)</label>
              <input
                type="text"
                name="userId"
                value={orderData.userId}
                onChange={handleChange}
                placeholder="User ID if available"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name*</label>
              <input
                type="text"
                name="firstName"
                value={orderData.firstName}
                onChange={handleChange}
                required
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label>Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={orderData.lastName}
                onChange={handleChange}
                required
                placeholder="Last Name"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email*</label>
              <input
                type="email"
                name="email"
                value={orderData.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
              />
            </div>
            <div className="form-group">
              <label>Phone*</label>
              <input
                type="tel"
                name="phone"
                value={orderData.phone}
                onChange={handleChange}
                required
                placeholder="Phone Number"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Delivery Address</h3>
          <div className="form-group">
            <label>Street*</label>
            <input
              type="text"
              name="street"
              value={orderData.street}
              onChange={handleChange}
              required
              placeholder="Street Address"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>City*</label>
              <input
                type="text"
                name="city"
                value={orderData.city}
                onChange={handleChange}
                required
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label>State*</label>
              <input
                type="text"
                name="state"
                value={orderData.state}
                onChange={handleChange}
                required
                placeholder="State"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Zip Code*</label>
              <input
                type="text"
                name="zipcode"
                value={orderData.zipcode}
                onChange={handleChange}
                required
                placeholder="Zip Code"
              />
            </div>
            <div className="form-group">
              <label>Country*</label>
              <input
                type="text"
                name="country"
                value={orderData.country}
                onChange={handleChange}
                required
                placeholder="Country"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Order Items</h3>
          
          {selectedItems.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-row">
                {foodList && foodList.length > 0 ? (
                  <div className="form-group item-select">
                    <label>Food Item*</label>
                    <select
                      value={item.foodId || ""}
                      onChange={(e) => handleItemChange(index, 'foodId', e.target.value)}
                      required
                    >
                      <option value="">Select Food Item</option>
                      {foodList.map(food => (
                        <option key={food._id} value={food._id}>
                          {food.name} - ₹{food.price}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="form-group item-name">
                      <label>Item Name*</label>
                      <input
                        type="text"
                        value={item.name || ""}
                        onChange={(e) => handleManualItemChange(index, 'name', e.target.value)}
                        required
                        placeholder="Item Name"
                      />
                    </div>
                    <div className="form-group item-price">
                      <label>Price*</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price || 0}
                        onChange={(e) => handleManualItemChange(index, 'price', e.target.value)}
                        required
                        placeholder="Price"
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group item-quantity">
                  <label>Quantity*</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) => foodList && foodList.length > 0 
                      ? handleItemChange(index, 'quantity', e.target.value)
                      : handleManualItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group item-price">
                  <label>Subtotal</label>
                  <div className="price-display">₹{(item.price || 0) * (item.quantity || 1)}</div>
                </div>
                
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeItem(index)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          
          <button type="button" className="add-item-btn" onClick={addItem}>
            + Add Item
          </button>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{calculateTotal() - 26}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee:</span>
              <span>₹26</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Payment Status</h3>
          <div className="form-group">
            <select
              name="paymentStatus"
              value={orderData.paymentStatus}
              onChange={handleChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading || selectedItems.length === 0} className="create-order-btn">
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;