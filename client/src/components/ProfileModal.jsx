import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';

export default function ProfileModal({ onClose }) {
  const { token, username: contextUsername } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (token) {
      loadProfile();
    } else {
      // Clear profile picture preview when not logged in
      setProfilePicturePreview(null);
    }
  }, [token]);

  const loadProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Get user profile from backend
      const user = await api.get('/users/profile/me');
      
      setUsername(user.username || '');
      setEmail(user.email || ''); // Pre-fill with actual email from database
      
      // Load profile picture if exists in database
      if (user.profilePictureUrl) {
        const profilePicUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${user.profilePictureUrl}`;
        setProfilePicturePreview(profilePicUrl);
        // Save to localStorage for persistence
        localStorage.setItem('profilePictureUrl', user.profilePictureUrl);
      } else {
        // Clear preview and localStorage if no profile picture
        setProfilePicturePreview(null);
        localStorage.removeItem('profilePictureUrl');
      }
      
    } catch (e) {
      // Fallback to localStorage if endpoint fails
      const storedUsername = localStorage.getItem('username') || contextUsername || '';
      const storedEmail = localStorage.getItem('email') || '';
      setUsername(storedUsername);
      setEmail(storedEmail);
      
      // Try to load profile picture from localStorage
      const storedProfilePicUrl = localStorage.getItem('profilePictureUrl');
      if (storedProfilePicUrl) {
        setProfilePicturePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${storedProfilePicUrl}`);
      }
      
      console.error('Failed to load profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
      
      if (!allowedTypes.includes(file.type) || !allowedExtensions.test(file.name)) {
        setError('Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setError(''); // Clear any previous errors
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate passwords ONLY if user wants to change password
    const wantsToChangePassword = newPassword || currentPassword || confirmPassword;
    if (wantsToChangePassword) {
      if (!currentPassword) {
        setError("Please enter your current password to change it");
        return;
      }
      if (!newPassword) {
        setError("Please enter a new password");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords don't match");
        return;
      }
    }

    try {
      setSaving(true);
      
      // Prepare form data - only include fields that have values
      const formData = new FormData();
      
      // Always include username and email (they may have been edited)
      if (username && username.trim() !== '') {
        formData.append('username', username.trim());
      }
      if (email && email.trim() !== '') {
        formData.append('email', email.trim());
      }
      
      // Only include password fields if user wants to change password
      if (currentPassword && newPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('password', newPassword);
      }
      
      // Only include profile picture if a new one is selected
      // If no new picture is selected, existing one from database is preserved
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      // Update profile
      const updatedUser = await api.put('/users/profile', formData);
      
      // Update localStorage with latest values
      if (updatedUser.username) {
        localStorage.setItem('username', updatedUser.username);
      }
      if (updatedUser.email) {
        localStorage.setItem('email', updatedUser.email);
      }
      
      // Save profile picture URL to localStorage for persistence
      // Always save it (even if null) to ensure proper state
      if (updatedUser.profilePictureUrl) {
        localStorage.setItem('profilePictureUrl', updatedUser.profilePictureUrl);
      } else {
        // If no profile picture in response, remove from localStorage
        localStorage.removeItem('profilePictureUrl');
      }

      setMessage('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear the selected file but keep the preview if we have one from database
      setProfilePicture(null);
      
      // Reload the profile to get the updated picture URL from database
      // This ensures we have the latest data including profilePictureUrl
      await loadProfile();
      
      // Wait a moment to show success message, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (e) {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to update profile';
      setError(errorMessage);
      
      // If it's a file error, clear the file input
      if (errorMessage.includes('file') || errorMessage.includes('File')) {
        setProfilePicture(null);
        setProfilePicturePreview(null);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content card" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}>View Profile</h2>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: '1.25rem' }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Profile Picture */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Profile Picture
              </label>
              {profilePicturePreview ? (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
                  <img
                    src={profilePicturePreview}
                    alt="Profile Preview"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="secondary"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    margin: '0 auto 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: '#999'
                  }}
                >
                  👤
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                style={{ marginTop: '0.5rem' }}
              />
              <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Accepted formats: JPG, JPEG, PNG, GIF, WEBP (Max 5MB)
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Current Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Current Password (required to change password)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ position: 'absolute', right: 6, top: 6 }}
                >
                  {showCurrentPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                New Password (leave blank to keep current)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: 6, top: 6 }}
                >
                  {showNewPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {newPassword && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: 6, top: 6 }}
                  >
                    {showConfirmPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div style={{ marginBottom: '1rem', color: '#059669', fontSize: '0.875rem' }}>
                {message}
              </div>
            )}

            {error && (
              <div style={{ marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

