function RegisterBrandSection() {
  const features = [
    { icon: '✅', text: 'Join thousands of satisfied customers' },
    { icon: '🎁', text: 'Get exclusive member discounts' },
    { icon: '🚀', text: 'Fast checkout and order tracking' },
    { icon: '💬', text: '24/7 priority customer support' }
  ];

  return (
    <div className="register-brand">
      <div className="brand-content">
        <div className="brand-logo">
          <span>CA</span>
        </div>
        <h1 className="brand-name">COLD AIR</h1>
        <p className="brand-tagline">AIRCONDITIONING TRADING</p>
        <div className="brand-features">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RegisterBrandSection;