@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_cart(current_user):
    try:
        # Delete all cart items for the current user
        CartItem.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Cart cleared successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
