import { useState } from 'react';
import './Settings.css';
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import PreferencesSettings from './PreferencesSettings';

function Settings() {
  const [user, setUser] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  });

  const handleUpdateProfile = (updatedData) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const handleBack = () => {
    window.location.href = '/home';
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={handleBack}>
          ←
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <ProfileSettings user={user} onUpdateProfile={handleUpdateProfile} />
        <AccountSettings />
        <NotificationSettings />
        <PrivacySettings />
        <PreferencesSettings />
      </div>
    </div>
  );
}

export default Settings;