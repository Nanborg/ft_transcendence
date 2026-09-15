import { ProfileDetails } from '../features/profile/ProfileDetails';
import { useEffect, useState } from 'react';
import { PageHeading } from '../components/PageHeading';

// WHY: Profile page owns editable current-user profile
export function ProfilePage({
	profileStatus, profileError, profileUser,
	onSessionExpired, onProfileUpdated, onUpdateProfile,
})
{
	const [username, setUsername] = useState('');
	const [avatar, setAvatar] = useState('');
	const [saveStatus, setSaveStatus] = useState('idle');
	const [saveError, setSaveError] = useState('');

	useEffect(() =>
	{
		if (profileUser)
		{
			// SYNC: Form resets when profile reloads
			setUsername(profileUser.username || profileUser.name || '');
			setAvatar(profileUser.avatar || '');
		}
	}, [profileUser]);

	async function handleSubmit(event)
	{
		event.preventDefault();
		if (!onUpdateProfile)
			// SAFETY: Missing update handler disables submit
			return;
		setSaveStatus('loading');
		setSaveError('');
		try
		{
			// REQUIRED: Backend receives trimmed profile fields
			const result = await onUpdateProfile({ username: username.trim(), avatar: avatar.trim(), });
			const updateUser = result.user || result;
			// SYNC: App auth session gets updated user
			onProfileUpdated(updateUser);
			setSaveStatus('saved');
		}
		catch (error)
		{
			if (error.status === 401 || error.status === 403)
			{
				// SAFETY: Auth error handled by App
				onSessionExpired(error.message);
				return;
			}
			setSaveStatus('error');
			setSaveError(error.message);
		}
	}

	let saveLabel = 'Save Profile';
	if (saveStatus === 'loading')
		saveLabel = 'Saving...';

	return (
		<div className="shell-screen shell-screen--profile">
			<PageHeading
				title="Profile"
				actions={[
					{ label: 'Match History', href: '#/match-history' },
					{ label: 'Back to Menu', href: '#/' },
				]}
			/>
			<div className="profile-panel">
				{profileStatus === 'empty' && (
					<div className="profile-empty">
						<p>Login to view your profile.</p>
						<a href="#/login">Go to Login</a>
					</div>
				)}
				{profileStatus === 'loading' && <p className="profile-loading">Loading profile...</p>}
				{profileStatus === 'error' && <p className="profile-error" role="alert">{profileError}</p>}
				{profileStatus === 'loaded' && profileUser && (
					<ProfileDetails
						profileUser={profileUser}
						editForm={(
							<form className="profile-edit-form shell-window" onSubmit={handleSubmit}>
								<label htmlFor="profile-username">
									Username
									<input id="profile-username" name="username" className="form-control" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
								</label>
								<label htmlFor="profile-avatar-url">
									Avatar URL
									<input id="profile-avatar-url" name="avatarUrl" className="form-control" value={avatar} onChange={(event) => setAvatar(event.target.value)} autoComplete="url" />
								</label>
								<button className="btn btn-success" type="submit" disabled={saveStatus === 'loading' || !username.trim()}>{saveLabel}</button>
								{saveStatus === 'saved' && <p className="alert alert-success">Profile saved.</p>}
								{saveStatus === 'error' && <p className="alert alert-danger" role="alert">{saveError}</p>}
							</form>
						)}
					/>
				)}
			</div>
		</div>
	);
}
