import { useState } from 'react';

function ProfileSettings({ user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: user?.phone || '+65 9123 4567',
    address: user?.address || 'Singapore'
  });

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="settings-section">
      <div className="section-title">
        <span className="section-icon">👤</span>
        <h2>Profile Information</h2>
      </div>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Full Name</div>
            <div className="setting-description">Your display name</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="setting-input"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.name}</div>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Email Address</div>
            <div className="setting-description">Your login email</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="setting-input"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.email}</div>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Phone Number</div>
            <div className="setting-description">Contact number</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="setting-input"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.phone}</div>
          )}
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Address</div>
            <div className="setting-description">Your location</div>
          </div>
          {isEditing ? (
            <div className="edit-mode">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="setting-input"
              />
            </div>
          ) : (
            <div className="setting-value">{formData.address}</div>
          )}
        </div>

        {!isEditing ? (
          <div className="setting-item">
            <button onClick={() => setIsEditing(true)} className="edit-btn" style={{ color: '#1E88E5' }}>
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="setting-item">
            <div className="edit-buttons">
              <button onClick={handleSave} className="edit-btn save-btn">✓ Save</button>
              <button onClick={() => setIsEditing(false)} className="edit-btn cancel-btn">✗ Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSettings;