# Add Razorpay configuration
app.config['RAZORPAY_KEY_ID'] = os.getenv('RAZORPAY_KEY_ID', '')
app.config['RAZORPAY_KEY_SECRET'] = os.getenv('RAZORPAY_KEY_SECRET', '')
