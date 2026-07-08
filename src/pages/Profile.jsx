import { useState, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PasswordInput from '../components/common/PasswordInput';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePhoto, updateUserName, changeUserPassword, logProfileUpdate } from '../firebase/profile.service';
import { parseFullName } from '../utils/nameHelpers';
import { formatFirestoreTimestamp } from '../utils/formatDate';
import styles from './Profile.module.css';

export default function Profile() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [nameForm, setNameForm] = useState(userProfile?.fullName || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { initials } = parseFullName(userProfile?.fullName || '');
  const actor = { uid: currentUser.uid, role: userProfile.role, fullName: userProfile.fullName, email: userProfile.email };

  const roleBadgeClass = (role) => {
    if (role === 'chief') return styles.roleChief;
    if (role === 'admin') return styles.roleAdmin;
    return styles.roleUser;
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB.');
      return;
    }

    try {
      setUploading(true);
      await uploadProfilePhoto(currentUser.uid, file);
      await refreshProfile();
      await logProfileUpdate(actor, 'Updated profile picture');
    } catch (err) {
      setUploadError('Failed to upload photo. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');

    const trimmed = nameForm.trim();
    if (!trimmed || trimmed.split(/\s+/).length < 2) {
      setNameError('Please enter your full name (surname and first name).');
      return;
    }

    try {
      setNameSaving(true);
      await updateUserName(currentUser, trimmed);
      await refreshProfile();
      await logProfileUpdate(actor, 'Updated profile name');
      setNameSuccess('Name updated successfully.');
    } catch (err) {
      setNameError('Could not update name. Try again.');
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await changeUserPassword(currentUser, passwordForm.currentPassword, passwordForm.newPassword);
      await logProfileUpdate(actor, 'Changed password');
      setPasswordSuccess('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect.');
      } else {
        setPasswordError('Could not change password. Try again.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Identity Card */}
        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarInitials}>{initials || '?'}</div>
              )}
              <div className={styles.uploadOverlay} onClick={() => fileInputRef.current?.click()}>
                📷
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenFileInput}
                onChange={handlePhotoSelect}
              />
            </div>

            <div className={styles.identityInfo}>
              <h2>{userProfile.fullName}</h2>
              <div>{userProfile.email}</div>
              <span className={`${styles.roleBadge} ${roleBadgeClass(userProfile.role)}`}>
                {userProfile.role} account
              </span>
              {uploading && <div className={styles.uploadStatus}>Uploading photo...</div>}
              {uploadError && <div className={styles.uploadStatus} style={{ color: 'var(--color-danger)' }}>{uploadError}</div>}
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoBox}>
              <div className={styles.infoLabel}>Account Status</div>
              <div className={`${styles.infoValue} ${styles.statusActive}`}>
                {userProfile.status === 'active' ? 'Active' : userProfile.status}
              </div>
            </div>
            <div className={styles.infoBox}>
              <div className={styles.infoLabel}>Member Since</div>
              <div className={styles.infoValue}>{formatFirestoreTimestamp(userProfile.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Edit Name</h3>

          {nameSuccess && <div className={styles.successMsg}>{nameSuccess}</div>}
          {nameError && <div className={styles.errorMsg}>{nameError}</div>}

          <form onSubmit={handleNameSubmit}>
            <div className={styles.field}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={nameForm}
                onChange={(e) => setNameForm(e.target.value)}
              />
            </div>
            <button className={styles.saveBtn} type="submit" disabled={nameSaving}>
              {nameSaving ? 'Saving...' : 'Save Name'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Change Password</h3>

          {passwordSuccess && <div className={styles.successMsg}>{passwordSuccess}</div>}
          {passwordError && <div className={styles.errorMsg}>{passwordError}</div>}

          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.field}>
              <label htmlFor="currentPassword">Current Password</label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="newPassword">New Password</label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <PasswordInput
                id="confirmNewPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button className={styles.saveBtn} type="submit" disabled={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}