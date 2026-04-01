import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Home.css';
import Header from './Header';
import SideMenu from './SideMenu';
import NotificationsModal from './NotificationsModal';
import CartModal from '../shop/CartSidebar';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import BrandsSection from './BrandsSection';
import InfoSection from './InfoSection';
import Footer from './Footer';

function Home() {
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  const [notifications] = useState([
    { id: 1, title: 'Welcome!', message: 'Thank you for joining Cold Air', time: 'Just now', unread: true },
    { id: 2, title: 'Special Offer', message: '20% off on all AC services this week!', time: '2 hours ago', unread: true },
    { id: 3, title: 'Booking Confirmed', message: 'Your service appointment is confirmed', time: 'Yesterday', unread: false },
  ]);

  const services = [
    { id: 'service_1', name: 'General Cleaning', icon: '🧹', price: 80, description: 'Basic AC cleaning service', category: 'service' },
    { id: 'service_2', name: 'Chemical Cleaning', icon: '🧪', price: 120, description: 'Deep chemical cleaning', category: 'service' },
    { id: 'service_3', name: 'AC Overhaul', icon: '🔧', price: 250, description: 'Complete AC overhaul', category: 'service' },
  ];

  const brands = [
    'DAIKIN', 'Carrier', 'McQuay', 'TOSHIBA', 'FUJITSU', 
    'MITSUBISHI', 'LENNOX', 'LG', 'Panasonic', 'SAMSUNG', 'SHARP'
  ];

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('addresses');
    localStorage.removeItem('orders');
    localStorage.removeItem('ac_units');
    localStorage.removeItem('failed_attempts_');
    localStorage.removeItem('aeropulse_users');
    
    // Clear cart from context
    clearCart();
    
    // Navigate to login page
    navigate('/login');
  };

  const handleAddToCart = (service) => {
    const product = {
      id: service.id,
      name: service.name,
      icon: service.icon,
      price: service.price,
      category: service.category,
      description: service.description
    };
    addToCart(product);
    alert(`${service.name} added to cart!`);
  };

  const handleBookNow = () => {
    alert('Booking service!');
  };

  const handleCheckout = () => {
    navigate('/checkout');
    setShowCart(false);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="home-container">
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNotificationClick={() => {
          setShowNotifications(!showNotifications);
          setShowCart(false);
        }}
        onCartClick={() => {
          setShowCart(!showCart);
          setShowNotifications(false);
        }}
        notificationCount={unreadCount}
      />

      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activePage={activePage}
        onLogout={handleLogout}
      />

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
      />

      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        getCartTotal={getCartTotal}
      />

      <main className="main-content">
        <div className="content-wrapper">
          <HeroSection onBookNow={handleBookNow} />
          <ServicesSection services={services} onAddToCart={handleAddToCart} />
          <BrandsSection brands={brands} />
          <InfoSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;