import { useState, useEffect, useRef, useCallback } from 'react';
import './Login.css';
import LoginBrandSection from './LoginBrandSection';
import LoginForm from './LoginForm';
import RoleSelector from './RoleSelector';
import LockoutWarning from './LockOutWarning';
import GoogleButton from './GoogleButton';

function Login({ onLogin }) {
  const [user, setUser] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const timerRef = useRef(null);

  const roles = [
    { id: 'customer', label: 'Customer', icon: '👤' },
    { id: 'technician', label: 'Technician', icon: '🔧' }
  ];

  const getUsers = useCallback(() => {
    const savedUsers = localStorage.getItem('aeropulse_users');
    console.log('Getting users from localStorage:', savedUsers);
    return savedUsers ? JSON.parse(savedUsers) : [];
  }, []);

  const retrieveUser = useCallback((email) => {
    const users = getUsers();
    const found = users.find(u => u.email === email);
    console.log('Looking for email:', email, 'Found:', found);
    return found || null;
  }, [getUsers]);

  const setCurrent = useCallback((userData) => {
    console.log('Setting current user:', userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }, []);

  const getFailedAttempts = useCallback((email) => {
    const attempts = localStorage.getItem(`failed_attempts_${email}`);
    return attempts ? JSON.parse(attempts) : { count: 0, lockoutUntil: null };
  }, []);

  const saveFailedAttempts = useCallback((email, data) => {
    localStorage.setItem(`failed_attempts_${email}`, JSON.stringify(data));
  }, []);

  const canAttemptLogin = useCallback((email) => {
    const attempts = getFailedAttempts(email);
    if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
      const secondsLeft = Math.ceil((attempts.lockoutUntil - Date.now()) / 1000);
      return { canLogin: false, secondsLeft };
    }
    return { canLogin: true };
  }, [getFailedAttempts]);

  const handleLoginAttempt = useCallback(async (email, success) => {
    const attempts = getFailedAttempts(email);
    
    if (success) {
      saveFailedAttempts(email, { count: 0, lockoutUntil: null });
      return { success: true };
    } else {
      const newCount = (attempts.count || 0) + 1;
      let lockoutUntil = null;
      let lockoutDuration = 0;
      
      if (newCount >= 3) {
        lockoutDuration = 60000 + (newCount - 3) * 30000;
        lockoutUntil = Date.now() + lockoutDuration;
      }
      
      saveFailedAttempts(email, { count: newCount, lockoutUntil });
      
      if (lockoutUntil) {
        const lockoutSeconds = Math.ceil(lockoutDuration / 1000);
        return { locked: true, lockoutTime: lockoutSeconds, attempts: newCount };
      }
      
      return { locked: false, attempts: newCount };
    }
  }, [getFailedAttempts, saveFailedAttempts]);

  const clearLockout = useCallback((email) => {
    saveFailedAttempts(email, { count: 0, lockoutUntil: null });
    setLockoutInfo(null);
    if (timerRef.current) clearInterval(timerRef.current);
    alert('Lockout cleared. You can now attempt to login again.');
  }, [saveFailedAttempts]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (user.email) {
      const check = canAttemptLogin(user.email);
      if (!check.canLogin) {
        setLockoutInfo({
          message: `Account locked. Try again in ${check.secondsLeft} seconds.`,
          secondsLeft: check.secondsLeft
        });
        setSecondsLeft(check.secondsLeft);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setLockoutInfo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setLockoutInfo(null);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      setLockoutInfo(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [user.email, canAttemptLogin]);

  useEffect(() => {
    if (lockoutInfo && secondsLeft > 0) {
      setLockoutInfo(prev => ({
        ...prev,
        message: `Account locked. Try again in ${secondsLeft} seconds.`,
        secondsLeft: secondsLeft
      }));
    }
  }, [secondsLeft]);

  const handleRoleChange = (roleId) => {
    setUser(prev => ({ ...prev, role: roleId }));
  };

  const handleEmailChange = (email) => {
    setUser(prev => ({ ...prev, email }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (password) => {
    setUser(prev => ({ ...prev, password }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleForgotPassword = () => {
    if (!user.email) {
      alert('Please enter your email address first.');
      return;
    }
    
    if (window.confirm(`A password reset link will be sent to:\n${user.email}`)) {
      alert('Reset link sent! Check your email for password reset instructions.');
    }
  };

  const authenticateUser = async () => {
    console.log('Starting authentication...');
    setErrors({});
    setLoading(true);

    // Check for empty fields
    for (const [k, v] of Object.entries(user)) {
      if (k !== 'role' && (!v || v.length < 1)) {
        setErrors(prev => ({ ...prev, [k]: 'This field is required' }));
        alert('All fields must be filled!');
        setLoading(false);
        return;
      }
    }

    console.log('Checking lockout for:', user.email);
    const lockoutCheck = canAttemptLogin(user.email);
    if (!lockoutCheck.canLogin) {
      alert(`Too many failed attempts! Account locked for ${lockoutCheck.secondsLeft} seconds.`);
      setLockoutInfo({
        message: `Account locked. Try again in ${lockoutCheck.secondsLeft} seconds.`,
        secondsLeft: lockoutCheck.secondsLeft
      });
      setSecondsLeft(lockoutCheck.secondsLeft);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setLockoutInfo(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setLoading(false);
      return;
    }

    console.log('Retrieving user:', user.email);
    const valid = retrieveUser(user.email);
    console.log('Retrieved user:', valid);
    
    if (!valid) {
      console.log('User not found');
      const result = await handleLoginAttempt(user.email, false);
      if (result.locked) {
        alert(`Too many failed attempts! Account locked for ${result.lockoutTime} seconds.`);
        setLockoutInfo({
          message: `Account locked. Try again in ${result.lockoutTime} seconds.`,
          secondsLeft: result.lockoutTime
        });
        setSecondsLeft(result.lockoutTime);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setLockoutInfo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors(prev => ({ ...prev, email: 'Invalid credentials' }));
        alert(`Invalid email or password! Attempts: ${result.attempts}/3`);
      }
      setLoading(false);
      return;
    }

    console.log('Comparing passwords - Stored:', valid.password, 'Entered:', user.password);
    if (valid.password !== user.password) {
      console.log('Password mismatch');
      const result = await handleLoginAttempt(user.email, false);
      if (result.locked) {
        alert(`Too many failed attempts! Account locked for ${result.lockoutTime} seconds.`);
        setLockoutInfo({
          message: `Account locked. Try again in ${result.lockoutTime} seconds.`,
          secondsLeft: result.lockoutTime
        });
        setSecondsLeft(result.lockoutTime);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setLockoutInfo(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors(prev => ({ ...prev, password: 'Invalid credentials' }));
        alert(`Invalid email or password! Attempts: ${result.attempts}/3`);
      }
      setLoading(false);
      return;
    }

    console.log('Login successful!');
    await handleLoginAttempt(user.email, true);
    setCurrent({ ...valid, role: user.role });
    if (timerRef.current) clearInterval(timerRef.current);
    
    setLoading(false);
    console.log('Calling onLogin prop');
    onLogin();
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      const googleUserData = {
        email: 'googleuser@example.com',
        name_first: 'Google',
        name_last: 'User',
        profilePhoto: '',
        isGoogleAccount: true
      };
      const existingUser = retrieveUser(googleUserData.email);
      
      if (existingUser) {
        setCurrent({ ...existingUser, role: user.role });
        onLogin();
      } else {
        const newUser = {
          id: Date.now(),
          name_first: googleUserData.name_first,
          name_last: googleUserData.name_last,
          email: googleUserData.email,
          phone: '',
          password: 'google_auth_' + Date.now(),
          profilePhoto: googleUserData.profilePhoto,
          isGoogleAccount: true,
          role: user.role,
          createdAt: new Date().toISOString()
        };
        
        const users = getUsers();
        users.push(newUser);
        localStorage.setItem('aeropulse_users', JSON.stringify(users));
        setCurrent(newUser);
        onLogin();
      }
      setGoogleLoading(false);
    }, 1000);
  };

  const handleClearLockout = () => {
    if (user.email) {
      clearLockout(user.email);
      alert('Lockout cleared. You can now attempt to login again.');
    }
  };

  const handleSignUp = () => {
    window.location.href = '/register';
  };

  const selectedRole = roles.find(r => r.id === user.role) || roles[0];

  return (
    <div className="login-container">
      <div className="login-grid">
        <LoginBrandSection />
        
        <div className="login-form-section">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <LockoutWarning
            lockoutInfo={lockoutInfo}
            secondsLeft={secondsLeft}
            onClearLockout={handleClearLockout}
          />

          <RoleSelector
            selectedRole={selectedRole}
            roles={roles}
            onRoleChange={handleRoleChange}
            disabled={!!lockoutInfo}
          />

          <LoginForm
            email={user.email}
            password={user.password}
            errors={errors}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onSubmit={authenticateUser}
            loading={loading}
            disabled={!!lockoutInfo}
            onForgotPassword={handleForgotPassword}
          />

          <div className="divider">
            <span>or</span>
          </div>

          <GoogleButton
            onClick={handleGoogleSignIn}
            loading={googleLoading}
          />

          <div className="signup-link">
            Don't have an account? <button onClick={handleSignUp}>Sign up</button>
          </div>

          <div className="tips-card">
            <div className="tips-header">🔒 Security Information</div>
            <div className="tips-list">
              <span>• 3 login attempts before temporary lockout</span>
              <span>• Lockout duration increases with failed attempts</span>
              <span>• Google Sign-in creates account automatically</span>
              <span>• All data is stored locally on your device</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;