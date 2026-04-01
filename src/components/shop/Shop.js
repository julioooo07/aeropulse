import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Shop.css';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import CartSidebar from './CartSidebar';
import ProductModal from './ProductModal';

function Shop() {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, getCartCount, getCartTotal } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  console.log('Cart items in Shop:', cart);

  const categories = [
    { id: 'split', name: 'Split Type AC', count: 8 },
    { id: 'window', name: 'Window Type AC', count: 6 },
    { id: 'portable', name: 'Portable AC', count: 4 },
    { id: 'inverter', name: 'Inverter AC', count: 10 },
    { id: 'accessories', name: 'Accessories', count: 12 }
  ];

  const brands = [
    'DAIKIN', 'Carrier', 'McQuay', 'TOSHIBA', 'FUJITSU', 
    'MITSUBISHI', 'LENNOX', 'LG', 'Panasonic', 'SAMSUNG', 'SHARP'
  ];

  const products = [
    // Split Type ACs
    { id: 1, name: 'Premium Inverter Split AC', brand: 'DAIKIN', category: 'split', icon: '❄️', price: 28999, oldPrice: 34999, specs: '1.5HP', capacity: '1.5 HP', model: 'FTKS25', energyRating: '5 Stars', warranty: '5 Years', description: 'High efficiency inverter technology with smart cooling', discount: 17 },
    { id: 2, name: 'Deluxe Split AC', brand: 'LG', category: 'split', icon: '❄️', price: 25999, oldPrice: 29999, specs: '1.0HP', capacity: '1.0 HP', model: 'LS-Q12', energyRating: '4 Stars', warranty: '3 Years', description: 'Quiet operation with energy saving mode', discount: 13 },
    { id: 3, name: 'Eco Split AC', brand: 'Panasonic', category: 'split', icon: '❄️', price: 23999, specs: '1.5HP', capacity: '1.5 HP', model: 'CS-S12', energyRating: '4 Stars', warranty: '3 Years', description: 'Eco-friendly refrigerant with powerful cooling' },
    
    // Window Type ACs
    { id: 4, name: 'Window Type AC', brand: 'Carrier', category: 'window', icon: '❄️', price: 18999, oldPrice: 22999, specs: '1.5HP', capacity: '1.5 HP', model: 'CA-W15', energyRating: '3 Stars', warranty: '2 Years', description: 'Reliable window unit with easy installation', discount: 17 },
    { id: 5, name: 'Compact Window AC', brand: 'SAMSUNG', category: 'window', icon: '❄️', price: 15999, specs: '1.0HP', capacity: '1.0 HP', model: 'AR-W10', energyRating: '4 Stars', warranty: '2 Years', description: 'Space-saving design with powerful cooling' },
    
    // Inverter ACs
    { id: 6, name: 'Smart Inverter AC', brand: 'MITSUBISHI', category: 'inverter', icon: '❄️', price: 32999, oldPrice: 39999, specs: '2.0HP', capacity: '2.0 HP', model: 'MSZ-GS20', energyRating: '5 Stars', warranty: '5 Years', description: 'WiFi enabled with energy monitoring', discount: 17 },
    { id: 7, name: 'Ultra Inverter AC', brand: 'TOSHIBA', category: 'inverter', icon: '❄️', price: 29999, specs: '1.5HP', capacity: '1.5 HP', model: 'RAS-B15', energyRating: '5 Stars', warranty: '4 Years', description: 'Ultra-quiet operation with rapid cooling' },
    
    // Portable ACs
    { id: 8, name: 'Portable AC', brand: 'LG', category: 'portable', icon: '❄️', price: 21999, specs: '1.0HP', capacity: '1.0 HP', model: 'LP-Q10', energyRating: '3 Stars', warranty: '2 Years', description: 'Easy to move, perfect for any room' },
    
    // Accessories
    { id: 9, name: 'Remote Controller', brand: 'Universal', category: 'accessories', icon: '📱', price: 499, specs: 'Universal', capacity: 'N/A', model: 'RC-01', energyRating: 'N/A', warranty: '6 Months', description: 'Compatible with most AC brands' },
    { id: 10, name: 'Installation Kit', brand: 'Cold Air', category: 'accessories', icon: '🔧', price: 1299, specs: 'Full Kit', capacity: 'N/A', model: 'IK-101', energyRating: 'N/A', warranty: '1 Year', description: 'Complete installation accessories' },
    { id: 11, name: 'Air Filter', brand: '3M', category: 'accessories', icon: '🧹', price: 299, specs: 'Replacement', capacity: 'N/A', model: 'AF-3M', energyRating: 'N/A', warranty: '3 Months', description: 'HEPA filter for clean air' },
  ];

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
  };

  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout!');
    setIsCartOpen(false);
  };

  const handleBack = () => {
    navigate('/home');
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="shop-container">
      <div className="shop-header">
        <div className="shop-header-content">
          <div className="shop-header-left">
            <button className="back-btn" onClick={handleBack}>←</button>
            <h1 className="shop-title">Shop AC Units</h1>
          </div>
          <div className="shop-header-right">
            <button className="cart-icon-btn" onClick={() => setIsCartOpen(true)}>
              🛒
              {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="shop-main">
        {/* Sidebar */}
        <div className="shop-sidebar">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <div className="brand-filter">
            <h3 className="sidebar-title">Brands</h3>
            <input
              type="text"
              placeholder="Search brands..."
              className="brand-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="brand-list">
              <label className="brand-checkbox">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === 'all'}
                  onChange={() => setSelectedBrand('all')}
                />
                <span>All Brands</span>
              </label>
              {brands.map(brand => (
                <label key={brand} className="brand-checkbox">
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand}
                    onChange={() => setSelectedBrand(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="price-range">
            <h3 className="sidebar-title">Price Range</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                className="price-input"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                className="price-input"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 50000 })}
              />
            </div>
          </div>

          <button className="clear-filters" onClick={() => {
            setSelectedCategory('all');
            setSelectedBrand('all');
            setPriceRange({ min: 0, max: 50000 });
            setSearchTerm('');
            setSortBy('default');
          }}>
            Clear All Filters
          </button>
        </div>

        {/* Products Area */}
        <div className="products-area">
          <div className="products-header">
            <div className="results-count">
              Found {filteredProducts.length} products
            </div>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Sort by: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>

          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onProductClick={setSelectedProduct}
          />
        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        getCartTotal={getCartTotal}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

export default Shop;