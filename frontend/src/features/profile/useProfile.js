import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../../api/users';

/*export function useProfile(currentPageId, currentUser) {
*/
export function useProfile(currentPageId, currentUser, accessToken) {
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
        /*const user = await fetchCurrentUser(currentUser.name);*/
        const user = await fetchCurrentUser(accessToken);
        setProfileUser(user);
        setProfileStatus('loaded');
      } catch (error) {
        setProfileUser(null);
        setProfileStatus('error');
        setProfileError(error.message);
      }
    }
    loadProfile();
  }, [currentPageId, currentUser, accessToken]);

  return {
    profileUser,
    profileStatus,
    profileError,
  };
}