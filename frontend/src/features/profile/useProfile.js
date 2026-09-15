// WHY: Profile hook centralizes loading state so profile pages stay focused on rendering
// SAFETY: Session expiration handling stays in the hook that performs the protected request
import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../../api/users';

export function useProfile(currentPageId, currentUser, onSessionExpired,)
{
	const [profileUser, setProfileUser] = useState(null);
	const [profileStatus, setProfileStatus] = useState('idle');
	const [profileError, setProfileError] = useState('');

	useEffect(() =>
	{
		if (currentPageId !== 'profile')
			return;
		if (!currentUser)
		{
			setProfileUser(null);
			setProfileStatus('empty');
			setProfileError('');
			return;
		}
		setProfileStatus('loading');
		setProfileError('');
		async function loadProfile()
		{
			try {
				const user = await fetchCurrentUser();
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
	}, [currentPageId, currentUser, onSessionExpired]);

	return { profileUser, profileStatus, profileError, };
}
// WHY: Profile hook loads current-user profile state for the profile page
