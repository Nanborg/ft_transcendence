import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../../api/users';

export function useProfile(currentPageId, currentUser, accessToken, onSessionExpired,) {
  const [profileUser, setProfileUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState('idle');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (currentPageId !== 'profile') {
      return;
    }
    if (!currentUser || !accessToken) {
      setProfileUser(null);
      setProfileStatus('empty');
      setProfileError('');
      return;
    }
    setProfileStatus('loading');
    setProfileError('');
    async function loadProfile() {
      try {
        /*const user = await fetchCurrentUser(currentUser.username);*/
        const user = await fetchCurrentUser(accessToken);
        setProfileUser(user);
        setProfileStatus('loaded');
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          onSessionExpired(error.message);
          return;
        }
        setProfileUser(null);
        setProfileStatus('error');
        setProfileError(error.message);
      }
    }
    loadProfile();
  }, [currentPageId, currentUser, accessToken, onSessionExpired]);

  return {
    profileUser,
    profileStatus,
    profileError,
  };
}
