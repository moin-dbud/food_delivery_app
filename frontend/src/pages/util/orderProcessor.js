import axios from 'axios';
import { toast } from 'react-hot-toast';

export const processPendingOrder = async (url, token, setCartItems) => {
  try {
    // Check if there's a pending order in localStorage
    const pendingOrderJSON = localStorage.getItem('pendingOrder');
    
    if (!pendingOrderJSON) {
      return false; // No pending order
    }
    
    const orderData = JSON.parse(pendingOrderJSON);
    
    // Send the order to the backend
    const response = await axios.post(`${url}/api/order/place`, orderData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      // Clear the cart
      setCartItems({});
      
      // Clear the pending order from localStorage
      localStorage.removeItem('pendingOrder');
      
      // Show success message
      toast.success("Order placed successfully!");
      return true;
    } else {
      toast.error(response.data.message || "Failed to place order");
      return false;
    }
  } catch (error) {
    console.error("Order Processing Error:", error);
    toast.error("Error processing your order");
    return false;
  }
};