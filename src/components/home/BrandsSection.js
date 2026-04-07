import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function BrandsSection({ brands: externalBrands }) {
  const navigate = useNavigate();
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  // Brand data with image URLs - Your actual logo links preserved
  const brands = externalBrands || [
    { 
      id: 1, 
      name: 'Midea', 
      emoji: '❄️',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvl2GSFigO4nNXMWW1qO_VZ1GZwjVl5alpsw&s',
      description: 'Premium AC Solutions'
    },
    { 
      id: 2, 
      name: 'TCL', 
      emoji: '🌬️',
      logoUrl: 'https://cdn.manilastandard.net/wp-content/uploads/2023/02/TCL.png',
      description: 'Smart Air Conditioning'
    },
    { 
      id: 3, 
      name: 'Aux', 
      emoji: '🔧',
      logoUrl: 'https://auxaircon.com.ph/images/aux_logo.png',
      description: 'Energy Efficient'
    },
    { 
      id: 4, 
      name: 'Samsung', 
      emoji: '📱',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXFVQh2BQhYtWf9APXNliSnNTi7MBwV6yPFA&s',
      description: 'Innovation Technology'
    },
    { 
      id: 5, 
      name: 'Daikin', 
      emoji: '✨',
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwu8SCQH4joBnn0HXF5F_HQKBRb85KZ8ZkuA&s',
      description: 'World Leader in AC'
    },
    { 
      id: 6, 
      name: 'Carrier', 
      emoji: '💨',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Logo_of_the_Carrier_Corporation.svg',
      description: 'Inventor of AC'
    },
    { 
      id: 7, 
      name: 'LG', 
      emoji: '⚡',
      logoUrl: 'https://www.lg.com/content/dam/lge/common/logo/logo-lg-100-44.jpg',
      description: 'Life\'s Good'
    },
    { 
      id: 8, 
      name: 'American Home', 
      emoji: '🏠',
      logoUrl: 'https://ansons.ph/wp-content/uploads/2024/05/aham.jpg',
      description: 'Home Comfort Solutions'
    },
    { 
      id: 9, 
      name: 'Gree', 
      emoji: '🌿',
      logoUrl: 'https://logos-world.net/wp-content/uploads/2023/03/Gree-Logo.png',
      description: 'Eco-Friendly Cooling'
    },
  ];

  // Handler for when image fails to load
  const handleImageError = (brandId) => {
    setFailedImages(prev => ({ ...prev, [brandId]: true }));
  };

  // Handler for shop brand navigation
  const handleShopBrand = (brandName) => {
    navigate(`/shop?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <section className="brands-section">
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">Explore Our Brands</h2>
        <button 
          className="see-all"
          onClick={() => navigate('/shop')}
        >
          View All →
        </button>
      </div>
      
      {/* Brands Grid */}
      <div className="brands-grid">
        {brands.map((brand) => (
          <div 
            key={brand.id} 
            className={`brand-container ${hoveredBrand === brand.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredBrand(brand.id)}
            onMouseLeave={() => setHoveredBrand(null)}
            role="article"
            aria-label={`${brand.name} brand card`}
          >
            {/* Brand Card */}
            <div className="brand-card">
              {/* Brand Logo - Shows image if available, falls back to emoji */}
              <div className="brand-logo-wrapper">
                {!failedImages[brand.id] && brand.logoUrl ? (
                  <img 
                    src={brand.logoUrl} 
                    alt={`${brand.name} logo`}
                    className="brand-logo-img"
                    onError={() => handleImageError(brand.id)}
                  />
                ) : (
                  <div className="brand-logo-emoji" aria-hidden="true">
                    {brand.emoji}
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <h3 className="brand-name">{brand.name}</h3>
              <p className="brand-description">{brand.description}</p>
            </div>

            {/* Shop Button - Appears on hover */}
            <button 
              className={`shop-brand-btn ${hoveredBrand === brand.id ? 'visible' : ''}`}
              onClick={() => handleShopBrand(brand.name)}
              aria-label={`Shop ${brand.name} air conditioners`}
            >
              Shop {brand.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BrandsSection;