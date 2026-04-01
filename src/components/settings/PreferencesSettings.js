import { useState } from 'react';

function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    darkMode: false,
    autoBook: true
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
    alert(`${key} updated to ${value}`);
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon">⚙️</span>
        <h2>Preferences</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Language</div>
            <div className="setting-description">Choose your preferred language</div>
          </div>
          <select
            value={preferences.language}
            onChange={(e) => handlePreferenceChange('language', e.target.value)}
            className="setting-select"
          >
            <option value="English">English</option>
            <option value="Chinese">Chinese</option>
            <option value="Malay">Malay</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Currency</div>
            <div className="setting-description">Display currency format</div>
          </div>
          <select
            value={preferences.currency}
            onChange={(e) => handlePreferenceChange('currency', e.target.value)}
            className="setting-select"
          >
            <option value="SGD">SGD ($)</option>
            <option value="USD">USD ($)</option>
            <option value="MYR">MYR (RM)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Time Zone</div>
            <div className="setting-description">Set your local time zone</div>
          </div>
          <select
            value={preferences.timezone}
            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
            className="setting-select"
          >
            <option value="Asia/Singapore">Singapore (GMT+8)</option>
            <option value="Asia/Kuala_Lumpur">Kuala Lumpur (GMT+8)</option>
            <option value="Asia/Jakarta">Jakarta (GMT+7)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Dark Mode</div>
            <div className="setting-description">Switch to dark theme</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={preferences.darkMode} onChange={() => handlePreferenceChange('darkMode', !preferences.darkMode)} />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Auto-Booking</div>
            <div className="setting-description">Automatically book recurring services</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={preferences.autoBook} onChange={() => handlePreferenceChange('autoBook', !preferences.autoBook)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default PreferencesSettings;