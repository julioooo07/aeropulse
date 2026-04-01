function DeliveryAddress({ addresses, selectedAddress, onSelectAddress, onAddAddress }) {
  return (
    <div className="checkout-section">
      <div className="section-header">
        <h2>Delivery Address</h2>
        <button className="add-btn" onClick={onAddAddress}>+ Add New Address</button>
      </div>
      {addresses.map(address => (
        <div
          key={address.id}
          className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
          onClick={() => onSelectAddress(address)}
        >
          <div className="address-type">
            {address.type === 'home' ? '🏠 Home' : address.type === 'office' ? '🏢 Office' : '📍 Other'}
            {selectedAddress?.id === address.id && <span style={{ color: '#1E88E5', marginLeft: 'auto' }}>✓ Selected</span>}
          </div>
          <div className="address-details">
            <p><strong>{address.name}</strong></p>
            <p>{address.street}</p>
            <p>{address.city}, {address.postalCode}</p>
            <p>📞 {address.phone}</p>
          </div>
        </div>
      ))}
      {addresses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
          No saved addresses. Click "Add New Address" to continue.
        </div>
      )}
    </div>
  );
}

export default DeliveryAddress;