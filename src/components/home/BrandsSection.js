function BrandsSection({ brands }) {
  return (
    <div className="brands-section">
      <div className="section-header">
        <h2 className="section-title">Top Brands</h2>
      </div>
      <div className="brands-grid">
        {brands.map(brand => (
          <div key={brand} className="brand-card">
            <div className="brand-logo">❄️</div>
            <div className="brand-name">{brand}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandsSection;