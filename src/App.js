import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Home from './components/home/Home';
import Settings from './components/settings/Settings';
import MyUnit from './components/myunit/MyUnit';
import Shop from './components/shop/Shop';
import Contact from './components/contact/Contact';
import Services from './components/services/Services';
import Checkout from './components/checkout/Checkout';
import MyOrders from './components/orders/MyOrders';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    return !!currentUser;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} />
            <Route path="/myunit" element={isAuthenticated ? <MyUnit /> : <Navigate to="/login" replace />} />
            <Route path="/shop" element={isAuthenticated ? <Shop /> : <Navigate to="/login" replace />} />
            <Route path="/contact" element={isAuthenticated ? <Contact /> : <Navigate to="/login" replace />} />
            <Route path="/services" element={isAuthenticated ? <Services /> : <Navigate to="/login" replace />} />
            <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" replace />} />
            <Route path="/my-orders" element={isAuthenticated ? <MyOrders /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;