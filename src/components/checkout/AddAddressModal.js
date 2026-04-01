import { useState } from 'react';

function AddAddressModal({ onClose, onSave }) {
  const [address, setAddress] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const handleSubmit = () => {
    if (!address.name || !address.street || !address.city || !address.phone) {
      alert('Please fill in all required fields');
      return;
    }
    onSave({ ...address, id: Date.now() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="address-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Address</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Address Type</label>
            <select value={address.type} onChange={(e) => setAddress({ ...address, type: e.target.value })}>
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Recipient Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={address.name}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Street Address *</label>
            <input
              type="text"
              placeholder="House/Block/Lot No., Street"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                placeholder="Postal code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              placeholder="Contact number"
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={handleSubmit}>Save Address</button>
        </div>
      </div>
    </div>
  );
}

export default AddAddressModal;