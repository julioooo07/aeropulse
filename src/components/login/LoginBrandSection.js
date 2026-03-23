function LoginBrandSection() {
  const features = [
    { icon: '❄️', text: 'Premium Quality AC Units' },
    { icon: '🔧', text: 'Expert Installation Service' },
    { icon: '⭐', text: '24/7 Customer Support' },
    { icon: '🚚', text: 'Free Delivery Nationwide' }
  ];

  return (
    <div className="login-brand">
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

export default LoginBrandSection;