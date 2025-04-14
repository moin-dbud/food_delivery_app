# 🍔 Food Delivery App

A full-stack Food Delivery application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This project includes user-side ordering, an admin panel for managing food items and orders, and Google Forms integration for payments.

---

## 🚀 Features

### 👨‍🍳 User Panel
- View food items categorized by cuisine or type
- Add items to cart
- Place orders using Google Forms
- View "My Orders" section (manual entry from admin panel)

### 🛠️ Admin Panel
- Add, update, delete food items
- Manage and view all user orders
- Manually create orders received via Google Form

### 💳 Payment Integration
- Google Form used for order payment and info collection
- Stripe and Cashfree API (configured in `.env` but **not committed**)

---

## 📁 Project Structure
- food-del/ 
- ├── admin/ → Admin panel (React) 
- ├── backend/ → Node.js + Express API + MongoDB 
- │ └── .env → Environment variables (ignored from Git) 
- ├── frontend/ → User frontend (React) 
- └── README.md


---

## 🔐 Environment Variables

Create a `.env` file in `backend/` and include the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000

STRIPE_SECRET_KEY=your_stripe_key
CASHFREE_API_KEY=your_cashfree_key

  ```

| ⚠️ Note: The .env file is ignored from Git. Replace with your actual API keys and MongoDB URI.

## 💻 Installation
1. Clone the repository
```
   git clone https://github.com/your-username/food-del.git
cd food-del
```

2. Install dependencies
```
  cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

3. Start the servers
```
   # Start backend
cd backend
npm start

# Start frontend
cd frontend
npm start

# Start admin panel
cd admin
npm start

```

## ⚙️ Admin Access
To create and manage orders manually, login to the admin panel and:

- View new orders from Google Form

- Manually add them into the database

- Users can then see their orders in the "My Orders" section

## 🛡️ Security

- Sensitive keys are stored in .env files and are not committed.

- If accidentally exposed, revoke and regenerate keys from Stripe and Cashfree.

## 📌 Future Improvements

- Add real-time order sync with Google Forms or replace with a proper payment gateway

- Add user authentication with JWT

- Add delivery tracking status

- Upload food images from admin panel

## 👨‍💻 Author
### Moin Sheikh
[Instagram](https://www.instagram.com/moin__sheikh_02/)
[Github](https://github.com/moin-dbud)

