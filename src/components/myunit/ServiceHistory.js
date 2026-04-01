function ServiceHistory({ unit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Service History - {unit.brand} {unit.model}</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {unit.serviceHistory && unit.serviceHistory.length > 0 ? (
            <div className="history-list">
              {unit.serviceHistory.map((service, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-date">{service.date}</div>
                  <div className="history-service">{service.serviceType}</div>
                  <div className="history-details">{service.details}</div>
                  <div className="history-price">₱{service.price.toLocaleString()}</div>
                  {service.technician && (
                    <div className="history-details">Technician: {service.technician}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              No service history available for this unit.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="confirm-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ServiceHistory;