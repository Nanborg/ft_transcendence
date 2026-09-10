import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeading } from '../components/PageHeading';
import { addFriend } from '../api/friends';
import { fetchUserMatchHistory } from '../api/scores';
import { fetchPublicUserProfile } from '../api/users';
import { ProfileDetails } from '../features/profile/ProfileDetails';
import { MatchHistoryPage } from './MatchHistoryPage';

function getRelationStatus(userId, friendsData)
{
  const friendList = friendsData?.friends || [];
  const pendingReceived = friendsData?.pendingReceived || [];
  const pendingSent = friendsData?.pendingSent || [];

  if (friendList.some(friend => Number(friend.id) === Number(userId)))
    return 'friend';
  if (pendingReceived.some(friend => Number(friend.id) === Number(userId)))
    return 'accept';
  if (pendingSent.some(friend => Number(friend.id) === Number(userId)))
    return 'pending';
  return 'none';
}

export function PublicProfilePage({ userId, currentUser, friends, onSessionExpired })
{
  const [profileUser, setProfileUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState('loading');
  const [profileError, setProfileError] = useState('');
  const [addStatus, setAddStatus] = useState('idle');
  const [addError, setAddError] = useState('');
  const relationStatus = useMemo(
    () => getRelationStatus(userId, friends.friends),
    [userId, friends.friends]
  );
  const loadVisitedMatchHistory = useCallback(
    () => fetchUserMatchHistory(userId),
    [userId]
  );

  useEffect(() =>
  {
    if (!currentUser)
    {
      setProfileStatus('empty');
      setProfileUser(null);
      setProfileError('');
      return undefined;
    }
    if (Number(currentUser.id) === Number(userId))
    {
      window.location.hash = '#/profile';
      return undefined;
    }

    let cancelled = false;
    async function loadProfile()
    {
      setProfileStatus('loading');
      setProfileError('');
      try
      {
        const user = await fetchPublicUserProfile(userId);
        if (!cancelled)
        {
          setProfileUser(user);
          setProfileStatus('loaded');
        }
      }
      catch (error)
      {
        if (error.status === 401 || error.status === 403)
        {
          onSessionExpired(error.message);
          return;
        }
        if (!cancelled)
        {
          setProfileUser(null);
          setProfileStatus('error');
          setProfileError(error.message);
        }
      }
    }
    loadProfile();
    return () =>
    {
      cancelled = true;
    };
  }, [currentUser, onSessionExpired, userId]);

  async function submitAddFriend()
  {
    setAddStatus('loading');
    setAddError('');
    try
    {
      await addFriend(userId);
      await friends.loadFriends();
      setAddStatus('saved');
    }
    catch (error)
    {
      if (error.status === 401 || error.status === 403)
      {
        onSessionExpired(error.message);
        return;
      }
      setAddStatus('error');
      setAddError(error.message);
    }
  }

  let friendAction = null;
  if (profileStatus === 'loaded' && relationStatus === 'none')
  {
    friendAction = (
      <button className="btn btn-primary" type="button" onClick={submitAddFriend} disabled={addStatus === 'loading'}>
        {addStatus === 'loading' ? 'Adding...' : 'Add friend'}
      </button>
    );
  }
  if (profileStatus === 'loaded' && relationStatus === 'accept')
  {
    friendAction = (
      <button className="btn btn-outline-success" type="button" onClick={submitAddFriend} disabled={addStatus === 'loading'}>
        {addStatus === 'loading' ? 'Accepting...' : 'Accept friend'}
      </button>
    );
  }
  if (profileStatus === 'loaded' && relationStatus === 'pending')
    friendAction = <span className="badge text-bg-secondary">Request pending</span>;
  if (profileStatus === 'loaded' && relationStatus === 'friend')
    friendAction = <span className="badge text-bg-success">Friend</span>;

  return (
    <div className="shell-screen shell-screen--profile">
      <PageHeading
        title={profileUser?.username ? `${profileUser.username}'s Profile` : 'Profile'}
        actions={[
          { label: 'Friends', href: '#/friends' },
          { label: 'Back to Menu', href: '#/' },
        ]}
      />
      <div className="profile-panel">
        {!currentUser && (
          <div className="profile-empty">
            <p>Login to view this profile.</p>
            <a href="#/login">Go to Login</a>
          </div>
        )}
        {currentUser && profileStatus === 'loading' && <p className="profile-loading">Loading profile...</p>}
        {currentUser && profileStatus === 'error' && <p className="profile-error" role="alert">{profileError}</p>}
        {currentUser && profileStatus === 'loaded' && profileUser && (
          <>
            <div className="profile-visit-actions shell-window">
              {friendAction}
              {addStatus === 'error' && <p className="alert alert-danger" role="alert">{addError}</p>}
              {addStatus === 'saved' && <p className="alert alert-success">Friend request updated.</p>}
            </div>
            <ProfileDetails profileUser={profileUser} />
            <MatchHistoryPage
              title={`${profileUser.username}'s Match History`}
              description=""
              loadMatches={loadVisitedMatchHistory}
              compact
            />
          </>
        )}
      </div>
    </div>
  );
}
