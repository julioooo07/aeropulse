import { useState } from 'react';

function ServiceBookingModal({ service, onClose, onConfirm }) {
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    address: '',
    notes: '',
    technician: 'any'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!bookingData.date) newErrors.date = 'Please select a date';
    if (!bookingData.time) newErrors.time = 'Please select a time';
    if (!bookingData.address) newErrors.address = 'Please enter your address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(service, bookingData);
    }
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Service</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="booking-info">
            <div className="booking-info-item">
              <span className="booking-label">Service:</span>
              <span className="booking-value">{service.name}</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-label">Price:</span>
              <span className="booking-value">₱{service.price.toLocaleString()}</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-label">Duration:</span>
              <span className="booking-value">{service.duration}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Select Date *</label>
            <input
              type="date"
              min={today}
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
            />
            {errors.date && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>{errors.date}</div>}
          </div>

          <div className="form-group">
            <label>Select Time *</label>
            <select
              value={bookingData.time}
              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
            >
              <option value="">Select time slot</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {errors.time && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>{errors.time}</div>}
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              rows="3"
              placeholder="Enter your complete address"
              value={bookingData.address}
              onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
            />
            {errors.address && <div style={{ color: '#f44336', fontSize: '12px', marginTop: '5px' }}>{errors.address}</div>}
          </div>

          <div className="form-group">
            <label>Preferred Technician</label>
            <select
              value={bookingData.technician}
              onChange={(e) => setBookingData({ ...bookingData, technician: e.target.value })}
            >
              <option value="any">Any available technician</option>
              <option value="senior">Senior technician (+₱200)</option>
              <option value="express">Express service (+₱500)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="Any special requests or instructions?"
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="confirm-btn" onClick={handleSubmit}>Confirm Booking</button>
        </div>
      </div>
    </div>
  );
}

export default ServiceBookingModal;