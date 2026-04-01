function OrderSummary({ cart, getCartTotal, selectedPayment }) {
  const subtotal = getCartTotal();
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return (
    <div className="checkout-section order-summary">
      <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
      <div className="summary-items">
        {cart.map(item => (
          <div key={item.id} className="summary-item">
            <div className="summary-item-image">{item.icon}</div>
            <div className="summary-item-details">
              <div className="summary-item-name">{item.name}</div>
              <div className="summary-item-price">₱{item.price.toLocaleString()}</div>
              <div className="summary-item-quantity">x{item.quantity}</div>
            </div>
            <div style={{ fontWeight: 'bold', color: '#1E88E5' }}>
              ₱{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>₱{subtotal.toLocaleString()}</span>
      </div>
      <div className="summary-row">
        <span>Shipping Fee</span>
        <span>FREE</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <span>₱{total.toLocaleString()}</span>
      </div>
      <button className="place-order-btn">Place Order</button>
    </div>
  );
}

export default OrderSummary;