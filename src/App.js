import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Home from './components/home/Home';
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
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;