from app import db
from datetime import datetime
import json

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='PENDING')  # PENDING, SUCCESS, FAILED
    amount = db.Column(db.Float, nullable=False)
    items = db.Column(db.Text, nullable=False)  # JSON string of ordered items
    address = db.Column(db.Text, nullable=False)  # JSON string of delivery address
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    razorpay_order_id = db.Column(db.String(100), nullable=True)
    payment_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, items, amount, address, email, phone, status, razorpay_order_id=None):
        self.user_id = user_id
        self.items = json.dumps(items)
        self.amount = amount
        self.address = json.dumps(address)
        self.email = email
        self.phone = phone
        self.status = status
        self.razorpay_order_id = razorpay_order_id
