import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Phone, Camera, Edit2, Save, X } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

const Profile = () => {
  const { user, profile, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      username: profile?.username || user?.displayName || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      photoURL: profile?.photoURL || user?.photoURL || ''
    };
  });

  useEffect(() => {
    // Always prioritize localStorage data over context data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setTempProfile(JSON.parse(savedProfile));
    } else {
      setTempProfile({
        username: profile?.username || user?.displayName || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || '',
        photoURL: profile?.photoURL || user?.photoURL || ''
      });
    }
  }, [profile, user]);

  const handleEdit = () => {
    setTempProfile({
      username: profile?.username || user?.displayName || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      photoURL: profile?.photoURL || user?.photoURL || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempProfile({
      username: profile?.username || user?.displayName || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      photoURL: profile?.photoURL || user?.photoURL || ''
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    console.log('Saving profile:', tempProfile);
    // Save to localStorage as fallback
    localStorage.setItem('userProfile', JSON.stringify(tempProfile));
    console.log('Saved to localStorage');
    
    // Try to save to backend if available
    if (updateProfile) {
      try {
        await updateProfile(tempProfile);
        console.log('Saved to backend');
      } catch (error) {
        console.error('Failed to save profile to backend:', error);
      }
    }
    setIsEditing(false);
    alert('Profile saved successfully!');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, photoURL: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-sidebar">
      <div className="profile-header">
        <div className="profile-header-icon">
          <User size={24} />
        </div>
        <div>
          <h2>Profile</h2>
          <p>Manage your account details</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-photo-section">
          <div className="profile-photo-container">
            {tempProfile.photoURL ? (
              <img src={tempProfile.photoURL} alt="Profile" className="profile-photo" />
            ) : (
              <div className="profile-photo-placeholder">
                <User size={48} />
              </div>
            )}
            {isEditing && (
              <label className="profile-photo-upload">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <label>
              <User size={16} />
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={tempProfile.username}
                onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                placeholder="Enter username"
              />
            ) : (
              <div className="profile-value">{tempProfile.username || 'Not set'}</div>
            )}
          </div>

          <div className="profile-field">
            <label>
              <Mail size={16} />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={tempProfile.email}
                onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                placeholder="Enter email"
              />
            ) : (
              <div className="profile-value">{tempProfile.email || 'Not set'}</div>
            )}
          </div>

          <div className="profile-field">
            <label>
              <Phone size={16} />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={tempProfile.phone}
                onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            ) : (
              <div className="profile-value">{tempProfile.phone || 'Not set'}</div>
            )}
          </div>
        </div>

        <ThemeSelector />

        <div className="profile-actions">
          {isEditing ? (
            <div className="profile-buttons-row">
              <button onClick={handleSave} className="profile-btn save">
                <Save size={16} />
                Save Changes
              </button>
              <button onClick={handleCancel} className="profile-btn cancel">
                <X size={16} />
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={handleEdit} className="profile-btn edit">
              <Edit2 size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
