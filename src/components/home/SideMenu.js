import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SideMenu({ isOpen, onClose, activePage, onLogout }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'myunit', label: 'My Unit', icon: '❄️', path: '/myunit' },
    { id: 'services', label: 'Services', icon: '🔧', path: '/services' },
    { id: 'shop', label: 'Shop', icon: '🛒', path: '/shop' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
    { id: 'contact', label: 'Contact', icon: '📞', path: '/contact' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // Call the onLogout function from Home
    onLogout();
    
    // Close modals and menu
    setShowLogoutModal(false);
    onClose();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="menu-overlay" onClick={onClose}></div>
      <div className={`side-menu open`}>
        <div className="menu-header">
          <h3>Menu</h3>
          <button className="close-menu" onClick={onClose}>×</button>
        </div>
        <div className="menu-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div className="menu-item" onClick={handleLogoutClick}>
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon">🚪</div>
              <h3>Logout Confirmation</h3>
            </div>
            <div className="logout-modal-body">
              <p>Are you sure you want to log out?</p>
              <p className="logout-warning">You will need to login again to access your account.</p>
            </div>
            <div className="logout-modal-footer">
              <button className="logout-cancel-btn" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={handleConfirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SideMenu;