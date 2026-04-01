function InfoSection() {
  return (
    <div className="info-section">
      <div className="info-card">
        <h3>🕒 Opening Hours</h3>
        <ul className="hours-list">
          <li><span>Monday - Friday</span><span>9:00am - 5:30pm</span></li>
          <li><span>Saturday</span><span>9:00am - 3:30pm</span></li>
          <li><span>Sunday & Public Holiday</span><span>Off</span></li>
        </ul>
      </div>
      <div className="info-card">
        <h3>📍 Contact Us</h3>
        <ul className="contact-info">
          <li><span>📍</span><span>192 Pandan Loop #06-29, Singapore 128381</span></li>
          <li><span>📞</span><span>+65 6760 0083</span></li>
          <li><span>✉️</span><span>wondercoolac@gmail.com</span></li>
        </ul>
      </div>
    </div>
  );
}

export default InfoSection;