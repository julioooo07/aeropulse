function PaymentMethod({ selectedMethod, onSelectMethod }) {
  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive the item', icon: '💰' },
    { id: 'gcash', name: 'GCash', description: 'Pay via GCash (QR code will be provided)', icon: '📱' },
    { id: 'credit', name: 'Credit/Debit Card', description: 'Visa, Mastercard, JCB', icon: '💳' }
  ];

  return (
    <div className="checkout-section">
      <h2 style={{ marginBottom: '20px' }}>Payment Method</h2>
      <div className="payment-methods">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className={`payment-option ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="payment-radio"></div>
            <div className="payment-info">
              <div className="payment-name">{method.name}</div>
              <div className="payment-description">{method.description}</div>
            </div>
            <span style={{ fontSize: '24px' }}>{method.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentMethod;