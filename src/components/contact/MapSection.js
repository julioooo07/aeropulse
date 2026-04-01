function MapSection() {
  const handleOpenMap = () => {
    window.open('https://maps.google.com/?q=192+Pandan+Loop+Singapore', '_blank');
  };

  return (
    <div className="map-section">
      <div className="map-placeholder">
        <h3>📍 Find Us Here</h3>
        <p>192 Pandan Loop #06-29, Singapore 128381</p>
        <button className="map-btn" onClick={handleOpenMap}>
          View on Google Maps →
        </button>
      </div>
    </div>
  );
}

export default MapSection;