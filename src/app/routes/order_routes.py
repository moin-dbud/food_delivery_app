from flask import Blueprint, request, jsonify
from app.models.order import Order
from app.models.user import User
from app.utils.auth import token_required
from app import db
import razorpay
import hmac
import hashlib
import os

order_bp = Blueprint('order', __name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET'))
)

@order_bp.route('/create-order', methods=['POST'])
@token_required
def create_order(current_user):
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Extract order details
    items = data.get('items', [])
    amount = data.get('amount', 0)
    address = data.get('address', {})
    email = data.get('email', '')
    phone = data.get('phone', '')
    
    if not items or not amount:
        return jsonify({'success': False, 'message': 'Items and amount are required'}), 400
    
    try:
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            'amount': int(amount * 100),  # amount in smallest currency unit (paise)
            'currency': 'INR',
            'receipt': f'order_{current_user.id}_{int(time.time())}',
            'payment_capture': 1  # auto-capture
        })
        
        # Create order in database
        order = Order(
            user_id=current_user.id,
            items=items,
            amount=amount,
            address=address,
            email=email,
            phone=phone,
            status="PENDING",
            razorpay_order_id=razorpay_order['id']
        )
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'order': {
                '_id': str(order.id),
                'amount': amount,
                'razorpayOrderId': razorpay_order['id']
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@order_bp.route('/verify-payment', methods=['POST'])
@token_required
def verify_payment(current_user):
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Extract payment details
    order_id = data.get('orderId')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_signature = data.get('razorpay_signature')
    
    if not all([order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        return jsonify({'success': False, 'message': 'Missing payment details'}), 400
    
    try:
        # Verify the payment signature
        params_dict = {
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_order_id': razorpay_order_id
        }
        
        # Generate expected signature
        key_secret = os.getenv('RAZORPAY_KEY_SECRET')
        generated_signature = hmac.new(
            key_secret.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify signature
        if generated_signature != razorpay_signature:
            # Update order status to FAILED
            order = Order.query.get(order_id)
            if order and order.user_id == current_user.id:
                order.status = "FAILED"
                db.session.commit()
            
            return jsonify({'success': False, 'message': 'Invalid payment signature'}), 400
        
        # Update order status to SUCCESS
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
            
        if order.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized access to order'}), 403
        
        order.status = "SUCCESS"
        order.payment_id = razorpay_payment_id
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Payment verified successfully'}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@order_bp.route('/<order_id>', methods=['DELETE'])
@token_required
def delete_order(current_user, order_id):
    try:
        order = Order.query.get(order_id)
        
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
            
        if order.user_id != current_user.id:
            return jsonify({'success': False, 'message': 'Unauthorized access to order'}), 403
        
        db.session.delete(order)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Order deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@order_bp.route('/user-orders', methods=['GET'])
@token_required
def get_user_orders(current_user):
    try:
        orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
        
        orders_list = []
        for order in orders:
            orders_list.append({
                'id': str(order.id),
                'items': order.items,
                'amount': order.amount,
                'status': order.status,
                'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
            
        return jsonify({'success': True, 'orders': orders_list}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
