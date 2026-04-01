import { useCart } from '../../context/CartContext';

function Header({ onMenuToggle, onNotificationClick, onCartClick, notificationCount }) {
  const { getCartCount } = useCart();

  return (
    <header className="home-header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuToggle}>
            ☰
          </button>
          <div className="logo">
            <div className="logo-icon">CA</div>
            <div className="logo-text">
              <h1>COLD AIR</h1>
              <p>Airconditioning Trading</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="icon-btn" onClick={onNotificationClick}>
            🔔
            {notificationCount > 0 && (
              <span className="badge">{notificationCount}</span>
            )}
          </div>
          <div className="icon-btn" onClick={onCartClick}>
            🛒
            {getCartCount() > 0 && <span className="badge">{getCartCount()}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;