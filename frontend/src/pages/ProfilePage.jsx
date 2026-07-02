import { ProfileDetails } from '../features/profile/ProfileDetails';
import { useEffect, useState } from 'react';

export function ProfilePage({
  profileStatus,
  profileError,
  profileUser,
  accessToken,
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
    if (!accessToken || !onUpdateProfile) {
      return;
    }
    setSaveStatus('loading');
    setSaveError('');
    try {
      const result = await onUpdateProfile(accessToken, {
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
      setSaveError(error.message)
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
            <form>
              <label>
                <input></input>
              </label>
              <label>
                <input></input>
              </label>
              <button></button>
            </form>
          </>
        )}
      </div>
    );
  }
}