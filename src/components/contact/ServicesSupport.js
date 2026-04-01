function ServicesSupport() {
  const services = [
    { icon: '❄️', name: 'AC Installation' },
    { icon: '🔧', name: 'Repair Services' },
    { icon: '🧹', name: 'Regular Maintenance' },
    { icon: '🧪', name: 'Chemical Cleaning' },
    { icon: '💨', name: 'Gas Top-up' },
    { icon: '📋', name: 'Consultation' }
  ];

  const support = [
    { title: 'Sales', phone: '+65 6760 0083', email: 'sales@coldair.com.sg' },
    { title: 'Customer Service', phone: '+65 9123 4567', email: 'support@coldair.com.sg' },
    { title: 'Technical Support', phone: '+65 8888 9999', email: 'tech@coldair.com.sg' }
  ];

  return (
    <>
      <div className="services-section">
        <h3>Our Services</h3>
        <div className="services-list">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <span>{service.icon}</span>
              <span>{service.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="support-section">
        <h3>Support Teams</h3>
        <div className="support-grid">
          {support.map((item, index) => (
            <div key={index} className="support-card">
              <div className="support-icon">
                {item.title === 'Sales' ? '💰' : item.title === 'Customer Service' ? '👥' : '🔧'}
              </div>
              <h4>{item.title}</h4>
              <p>{item.phone}</p>
              <p style={{ fontSize: '12px' }}>{item.email}</p>
              <a href={`mailto:${item.email}`} className="support-link">Contact →</a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ServicesSupport;