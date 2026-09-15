import { useEffect, useState } from 'react';
import { fetchPublicUserProfile } from '../../api/users';
import { ProfileDetails } from '../profile/ProfileDetails';

// WHY: Direct chat can preview a user profile inline
export function PublicProfilePanel({user, onBack,})
{
	const [profile, setProfile] = useState(null);
	const [status, setStatus] = useState('loading');
	const [error, setError] = useState('');

	useEffect(() =>
	{
		let cancelled = false;
		async function loadProfile()
		{
			// SYNC: Load profile for selected DM user
			setProfile(null);
			setStatus('loading');
			setError('');
			try {
				const loadedProfile = await fetchPublicUserProfile(user?.id);
				if (cancelled)
					// SAFETY: Ignore stale profile response
					return;
				setProfile(loadedProfile);
				setStatus('loaded');
			} catch (loadError) {
				if (cancelled)
					// SAFETY: Ignore stale load errors
					return;
				setStatus('error');
				setError(loadError.message);
			}
		}
		loadProfile();
		// SAFETY: Mark request stale on user change
		return () => { cancelled = true; };
	}, [user?.id]);

	return (
		<section
			className="direct-chat-panel direct-chat-panel--compact public-chat-profile"
			aria-label={`Profile of ${user?.name || 'user'}`}
		>
			<header className="public-chat-profile-header">
				<button type="button" className="btn btn-outline-secondary" onClick={onBack} >
					Back
				</button>

				<h3>{user?.name || 'User profile'}</h3>
			</header>

			<div className="public-chat-profile-content">
				{status === 'loading' && (<p className="room-muted"> Loading profile... </p>)}

				{status === 'error' && (
					<p className="alert alert-danger" role="alert">
						{error}
					</p>
				)}

				{status === 'loaded' && profile && (
					<ProfileDetails profileUser={profile} />
				)}
			</div>
		</section>
	);
}
