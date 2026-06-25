import { ProfileDetails } from '../features/profile/ProfileDetails';

export function ProfilePage({ profileStatus, profileError, profileUser }) {
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
        <ProfileDetails profileUser={profileUser} />
      )}
    </div>
  );
}