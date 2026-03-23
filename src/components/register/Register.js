import { useState } from 'react';
import './Register.css';
import RegisterBrandSection from './RegisterBrandSection';
import RegisterForm from './RegisterForm';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10-11 digits)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkExistingUser = (email) => {
    const users = localStorage.getItem('aeropulse_users');
    if (users) {
      const parsedUsers = JSON.parse(users);
      return parsedUsers.find(user => user.email === email);
    }
    return null;
  };

  const saveUser = (userData) => {
    const users = localStorage.getItem('aeropulse_users');
    let allUsers = users ? JSON.parse(users) : [];
    
    const newUser = {
      id: Date.now(),
      name_first: userData.firstName,
      name_last: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role,
      isGoogleAccount: false,
      profilePhoto: '',
      createdAt: new Date().toISOString()
    };
    
    allUsers.push(newUser);
    localStorage.setItem('aeropulse_users', JSON.stringify(allUsers));
    
    return newUser;
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Check if user already exists
    const existingUser = checkExistingUser(formData.email);
    if (existingUser) {
      setErrors({ ...errors, email: 'An account with this email already exists' });
      setLoading(false);
      return;
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save user
    saveUser(formData);
    
    setLoading(false);
    
    // Show success message and redirect to login
    alert('Registration successful! Please login with your credentials.');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="register-container">
      <div className="register-grid">
        <RegisterBrandSection />
        
        <div className="register-form-section">
          <div className="form-header">
            <h2>Create an Account</h2>
            <p>Join Cold Air and start shopping today</p>
          </div>

          <RegisterForm
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default Register;