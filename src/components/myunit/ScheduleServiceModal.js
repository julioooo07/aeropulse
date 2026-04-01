import { useState } from 'react';

function ScheduleServiceModal({ unit, onClose, onSchedule }) {
  const [service, setService] = useState({
    serviceType: 'General Cleaning',
    date: '',
    time: '',
    notes: '',
    technician: 'any'
  });

  const serviceTypes = [
    'General Cleaning',
    'Chemical Cleaning',
    'AC Overhaul',
    'Repair',
    'Gas Top-up',
    'Inspection'
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = () => {
    if (!service.date || !service.time) {
      alert('Please select date and time');
      return;
    }
    onSchedule(unit, service);
  };

  const getServicePrice = (type) => {
    switch(type) {
      case 'General Cleaning': return 899;
      case 'Chemical Cleaning': return 1299;
      case 'AC Overhaul': return 2500;
      case 'Repair': return 1499;
      case 'Gas Top-up': return 799;
      case 'Inspection': return 499;
      default: return 899;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Service - {unit.brand} {unit.model}</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Service Type</label>
            <select
              value={service.serviceType}
              onChange={(e) => setService({ ...service, serviceType: e.target.value })}
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type} - ₱{getServicePrice(type).toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                min={today}
                value={service.date}
                onChange={(e) => setService({ ...service, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <select
                value={service.time}
                onChange={(e) => setService({ ...service, time: e.target.value })}
              >
                <option value="">Select time</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Preferred Technician</label>
            <select
              value={service.technician}
              onChange={(e) => setService({ ...service, technician: e.target.value })}
            >
              <option value="any">Any available technician</option>
              <option value="senior">Senior technician (+₱200)</option>
              <option value="express">Express service (+₱500)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              rows="3"
              placeholder="Any specific issues or requests?"
              value={service.notes}
              onChange={(e) => setService({ ...service, notes: e.target.value })}
            />
          </div>

          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', marginTop: '15px' }}>
            <div className="info-row">
              <span>Service Price:</span>
              <span>₱{getServicePrice(service.serviceType).toLocaleString()}</span>
            </div>
            {service.technician === 'senior' && (
              <div className="info-row">
                <span>Senior Technician Fee:</span>
                <span>₱200</span>
              </div>
            )}
            {service.technician === 'express' && (
              <div className="info-row">
                <span>Express Service Fee:</span>
                <span>₱500</span>
              </div>
            )}
            <div className="info-row" style={{ fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
              <span>Total:</span>
              <span>₱{(getServicePrice(service.serviceType) + (service.technician === 'senior' ? 200 : service.technician === 'express' ? 500 : 0)).toLocaleString()}</span>
            </div>
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

export default ScheduleServiceModal;