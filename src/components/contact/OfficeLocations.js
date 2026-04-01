function OfficeLocations() {
  const locations = [
    { country: 'Singapore', office: 'Head Office', address: '192 Pandan Loop, Singapore' },
    { country: 'Indonesia', office: 'Jakarta Office', address: 'Jl. Sudirman No. 123, Jakarta' },
    { country: 'Malaysia', office: 'Kuala Lumpur', address: 'KL Sentral, Kuala Lumpur' },
    { country: 'Thailand', office: 'Bangkok Office', address: 'Sukhumvit Road, Bangkok' },
    { country: 'Vietnam', office: 'Ho Chi Minh', address: 'District 1, Ho Chi Minh City' },
    { country: 'Philippines', office: 'Manila Office', address: 'Makati City, Manila' }
  ];

  return (
    <div className="locations-section">
      <h3>Our Offices</h3>
      <p>Serving customers across Southeast Asia with dedicated local offices.</p>
      <div className="locations-grid">
        {locations.map((loc, index) => (
          <div key={index} className="location-card">
            <div className="location-country">{loc.country}</div>
            <div className="location-office">{loc.office}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>{loc.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfficeLocations;