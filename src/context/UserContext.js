import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'customer', 'admin', 'technician', 'superadmin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // Load data from localStorage on initial load
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      // Load current user session
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        setUser(parsedUser);
        setUserRole(parsedUser.role || 'customer');
        setIsAuthenticated(true);
        setCurrentSession(parsedUser);
      }

      // Load all registered users
      const allUsers = localStorage.getItem('registeredUsers');
      if (allUsers) {
        setRegisteredUsers(JSON.parse(allUsers));
      } else {
        // Initialize with demo users for testing
        const demoUsers = [
          {
            id: 'demo123',
            email: 'demo@example.com',
            password: 'demo123',
            name: 'Demo User',
            name_first: 'Demo',
            name_last: 'User',
            phone: '09123456789',
            address: '123 Demo Street',
            role: 'customer',
            createdAt: new Date().toISOString()
          },
          {
            id: 'admin001',
            email: 'admin@example.com',
            password: 'admin123',
            name: 'Admin User',
            name_first: 'Admin',
            name_last: 'User',
            phone: '09123456780',
            address: '456 Admin Street',
            role: 'admin',
            createdAt: new Date().toISOString()
          },
          {
            id: 'tech001',
            email: 'tech@example.com',
            password: 'tech123',
            name: 'Technician User',
            name_first: 'Tech',
            name_last: 'User',
            phone: '09123456781',
            address: '789 Tech Street',
            role: 'technician',
            skills: ['Electronics Repair', 'AC Repair', 'Plumbing'],
            createdAt: new Date().toISOString()
          },
          {
            id: 'super001',
            email: 'superadmin@example.com',
            password: 'super123',
            name: 'Super Admin',
            name_first: 'Super',
            name_last: 'Admin',
            phone: '09123456782',
            address: '999 Super Street',
            role: 'superadmin',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('registeredUsers', JSON.stringify(demoUsers));
        setRegisteredUsers(demoUsers);
        console.log('Demo users created:');
        console.log('Customer - Email: demo@example.com, Password: demo123');
        console.log('Admin - Email: admin@example.com, Password: admin123');
        console.log('Technician - Email: tech@example.com, Password: tech123');
        console.log('Super Admin - Email: superadmin@example.com, Password: super123');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save all registered users to localStorage
  const saveRegisteredUsers = (users) => {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    setRegisteredUsers(users);
  };

  // Register a new user (with role support)
  const register = async (userData, role = 'customer') => {
    try {
      let currentUsers = registeredUsers;
      if (currentUsers.length === 0) {
        const storedUsers = localStorage.getItem('registeredUsers');
        if (storedUsers) {
          currentUsers = JSON.parse(storedUsers);
          setRegisteredUsers(currentUsers);
        }
      }

      // Check if email already exists
      const emailExists = currentUsers.some(
        (user) => user.email === userData.email
      );

      if (emailExists) {
        throw new Error('Email already registered. Please login instead.');
      }

      // Check if phone number already exists (optional)
      const phoneExists = currentUsers.some(
        (user) => user.phone === userData.phone
      );

      if (phoneExists) {
        throw new Error('Phone number already registered.');
      }

      // Create new user object with role and additional metadata
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: role, // 'customer', 'admin', 'technician'
        createdAt: new Date().toISOString(),
        lastLogin: null,
        preferences: {
          language: 'English',
          currency: 'PHP',
          timezone: 'Asia/Manila',
          darkMode: false,
          autoBook: true
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          activityStatus: true
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          promotions: true,
          serviceUpdates: true
        }
      };

      // Add technician-specific fields if role is technician
      if (role === 'technician') {
        newUser.skills = userData.skills || [];
        newUser.assignedTasks = [];
        newUser.completedTasks = [];
        newUser.rating = 0;
        newUser.totalRatings = 0;
      }

      // Add admin-specific fields if role is admin
      if (role === 'admin') {
        newUser.permissions = userData.permissions || ['manage_inventory', 'view_sales'];
        newUser.department = userData.department || 'Operations';
      }

      // Add to registered users list
      const updatedUsers = [...currentUsers, newUser];
      saveRegisteredUsers(updatedUsers);

      // Auto-login after registration (only for customer role)
      if (role === 'customer') {
        await login(newUser.email, userData.password);
      }
      
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Login user with role support
  const login = async (email, password, role = null) => {
    try {
      let currentUsers = registeredUsers;
      
      if (currentUsers.length === 0) {
        const storedUsers = localStorage.getItem('registeredUsers');
        if (storedUsers) {
          currentUsers = JSON.parse(storedUsers);
          setRegisteredUsers(currentUsers);
        }
      }

      console.log('Current users:', currentUsers);
      console.log('Attempting login with email:', email);

      // Find user by email
      let foundUser = currentUsers.find(
        (user) => user.email === email
      );

      if (!foundUser) {
        throw new Error('Email not found. Please register first.');
      }

      // Check password
      if (foundUser.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }

      // If role is specified, check if user has that role
      if (role && foundUser.role !== role) {
        throw new Error(`Access denied. This account is not registered as a ${role}.`);
      }

      // Update last login time
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };

      // Update in registered users list
      const updatedUsersList = currentUsers.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      );
      saveRegisteredUsers(updatedUsersList);

      // Remove password before storing in session
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      // Set current session
      setUser(userWithoutPassword);
      setUserRole(userWithoutPassword.role);
      setIsAuthenticated(true);
      setCurrentSession(userWithoutPassword);
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      localStorage.setItem('userRole', userWithoutPassword.role);
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  // Login as admin
  const loginAsAdmin = async (email, password) => {
    return login(email, password, 'admin');
  };

  // Login as technician
  const loginAsTechnician = async (email, password) => {
    return login(email, password, 'technician');
  };

  // Login as superadmin
  const loginAsSuperAdmin = async (email, password) => {
    return login(email, password, 'superadmin');
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setCurrentSession(null);
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userIndex = registeredUsers.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...registeredUsers[userIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      const updatedUsersList = [...registeredUsers];
      updatedUsersList[userIndex] = updatedUser;
      saveRegisteredUsers(updatedUsersList);

      const { password, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      setUserRole(userWithoutPassword.role);
      setCurrentSession(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      localStorage.setItem('userRole', userWithoutPassword.role);

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userIndex = registeredUsers.findIndex(u => u.id === user.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...registeredUsers[userIndex],
        preferences: { ...registeredUsers[userIndex].preferences, ...preferences }
      };

      const updatedUsersList = [...registeredUsers];
      updatedUsersList[userIndex] = updatedUser;
      saveRegisteredUsers(updatedUsersList);

      const { password, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      setUserRole(userWithoutPassword.role);
      setCurrentSession(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  // Update privacy settings
  const updatePrivacy = async (privacy) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userIndex = registeredUsers.findIndex(u => u.id === user.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...registeredUsers[userIndex],
        privacy: { ...registeredUsers[userIndex].privacy, ...privacy }
      };

      const updatedUsersList = [...registeredUsers];
      updatedUsersList[userIndex] = updatedUser;
      saveRegisteredUsers(updatedUsersList);

      const { password, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      setCurrentSession(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  // Update notification settings
  const updateNotifications = async (notifications) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userIndex = registeredUsers.findIndex(u => u.id === user.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...registeredUsers[userIndex],
        notifications: { ...registeredUsers[userIndex].notifications, ...notifications }
      };

      const updatedUsersList = [...registeredUsers];
      updatedUsersList[userIndex] = updatedUser;
      saveRegisteredUsers(updatedUsersList);

      const { password, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      setCurrentSession(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userIndex = registeredUsers.findIndex(u => u.id === user.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      if (registeredUsers[userIndex].password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }

      const updatedUser = {
        ...registeredUsers[userIndex],
        password: newPassword,
        passwordUpdatedAt: new Date().toISOString()
      };

      const updatedUsersList = [...registeredUsers];
      updatedUsersList[userIndex] = updatedUser;
      saveRegisteredUsers(updatedUsersList);

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUsersList = registeredUsers.filter(u => u.id !== user.id);
      saveRegisteredUsers(updatedUsersList);

      logout();
      return { message: 'Account deleted successfully' };
    } catch (error) {
      throw error;
    }
  };

  // Get user by email
  const getUserByEmail = (email) => {
    return registeredUsers.find(user => user.email === email);
  };

  // Get all users (filter by role)
  const getAllUsers = (role = null) => {
    const usersWithoutPasswords = registeredUsers.map(({ password, ...user }) => user);
    if (role) {
      return usersWithoutPasswords.filter(user => user.role === role);
    }
    return usersWithoutPasswords;
  };

  // Get users by role (admin, technician, customer)
  const getUsersByRole = (role) => {
    return getAllUsers(role);
  };

  // Admin specific functions
  const getAllCustomers = () => getUsersByRole('customer');
  const getAllTechnicians = () => getUsersByRole('technician');
  const getAllAdmins = () => getUsersByRole('admin');

  // Check if user has specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Check if user is admin or superadmin
  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  // Check if user is technician
  const isTechnician = () => {
    return userRole === 'technician';
  };

  // Check if user is customer
  const isCustomer = () => {
    return userRole === 'customer';
  };

  const value = {
    user,
    userRole,
    isAuthenticated,
    loading,
    currentSession,
    register,
    login,
    loginAsAdmin,
    loginAsTechnician,
    loginAsSuperAdmin,
    logout,
    updateProfile,
    updatePreferences,
    updatePrivacy,
    updateNotifications,
    changePassword,
    deleteAccount,
    getUserByEmail,
    getAllUsers,
    getUsersByRole,
    getAllCustomers,
    getAllTechnicians,
    getAllAdmins,
    hasRole,
    isAdmin,
    isTechnician,
    isCustomer
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;