function ServiceCard({ service, onBook }) {
  return (
    <div className="service-card">
      <div className="service-card-image">
        {service.icon}
        {service.popular && <div className="service-badge">Popular</div>}
      </div>
      <div className="service-card-content">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-description">{service.description}</p>
        <div className="service-details">
          <span className="service-detail">⏱️ {service.duration}</span>
          <span className="service-detail">👥 {service.technicians} technicians</span>
        </div>
        <div className="service-price">
          ₱{service.price.toLocaleString()}
          <small> / service</small>
        </div>
        <button className="book-btn" onClick={() => onBook(service)}>
          Book Now →
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;