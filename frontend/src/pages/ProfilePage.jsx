import { ProfileDetails } from '../features/profile/ProfileDetails';
import { useEffect, useState } from 'react';

export function ProfilePage({
  profileStatus,
  profileError,
  profileUser,
  onSessionExpired,
  onProfileUpdated,
  onUpdateProfile,
}) {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profileUser) {
      setUsername(profileUser.username || profileUser.name || '');
      setAvatar(profileUser.avatar || '');
    }
  }, [profileUser]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!onUpdateProfile) {
      return;
    }
    setSaveStatus('loading');
    setSaveError('');
    try {
      const result = await onUpdateProfile({
        username: username.trim(),
        avatar: avatar.trim(),
      });
      const updateUser = result.user || result;
      onProfileUpdated(updateUser);
      setSaveStatus('saved');
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        onSessionExpired(error.message);
        return;
      }
      setSaveStatus('error');
      setSaveError(error.message);
    }
  }
  return (
    <div className="profile-panel">
      {profileStatus === 'empty' && (
        <div className="profile-empty">
          <p>Login to view your profile.</p>
          <a href="#/login">Go to Login</a>
        </div>
      )}
      {profileStatus === 'loading' && (
        <p className="profile-loading">Loading profile...</p>
      )}
      {profileStatus === 'error' && (
        <p className="profile-error" role="alert">{profileError}</p>
      )}
      {profileStatus === 'loaded' && profileUser && (
        <>
          <ProfileDetails profileUser={profileUser} />
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <label htmlFor="profile-username">
              Username
              <input
                id="profile-username"
                name="username"
                className="form-control"
                value={username}
                onChange={event => setUsername(event.target.value)}
                autoComplete="username"
                required>
              </input>
            </label>
            <label htmlFor="profile-avatar-url">
              Avatar URL
              <input
                id="profile-avatar-url"
                name="avatarUrl"
                className="form-control"
                value={avatar}
                onChange={event => setAvatar(event.target.value)}
                autoComplete="url">
              </input>
            </label>
            <button className="btn btn-success" type="submit" disabled={saveStatus === 'loading' || !username.trim()}>
              {saveStatus === 'loading' ? 'Saving...' : 'Save Profile'}
            </button>
            {saveStatus === 'saved' && <p className="alert alert-success">Profile saved.</p>}
            {saveStatus === 'error' && <p className="alert alert-danger" role="alert">{saveError}</p>}
          </form>
        </>
      )}
    </div>
  );
}
