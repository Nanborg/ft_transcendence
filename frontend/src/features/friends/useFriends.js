import { useCallback, useEffect, useState } from 'react';
import { acceptFriends, addFriend, fetchFriends, removeFriend } from '../../api/friends';

// WHY: Hook groups friend API state and realtime updates
export function useFriends(socket, currentUser, onSessionExpired)
{
	const [friends, setFriends] = useState([]);
	const [friendIdInput, setFriendIdInput] = useState('');
	const [friendsStatus, setFriendsStatus] = useState('idle');
	const [friendsError, setFriendsError] = useState('');

	const loadFriends = useCallback(async () =>
	{
		if (!currentUser)
		{
			// SAFETY: Logged-out users have no friend list
			setFriends([]);
			setFriendsStatus('empty');
			setFriendsError('');
			return;
		}
		setFriendsStatus('loading');
		setFriendsError('');

		try {
			// SYNC: Fetch canonical friendship state
			const nextFriends = await fetchFriends();
			setFriends(nextFriends);
			setFriendsStatus('loaded');
		} catch (error) {
			if (error.status === 401 || error.status === 403)
			{
				// SAFETY: Auth errors leave hook to App
				onSessionExpired(error.message);
				return;
			}
			setFriends([]);
			setFriendsStatus('error');
			setFriendsError(error.message);
		}
	}, [currentUser, onSessionExpired]);

	useEffect(() => { loadFriends(); }, [loadFriends]);

	useEffect(() =>
	{
		// SAFETY: Realtime updates need socket
		if(!socket)
			return undefined;
		function handleUserStatus(payload)
		{
			// SYNC: Update online flag without full reload
			setFriends((currentFriends) =>
			{
				if (!currentFriends?.friends)
					return currentFriends;
				const updatedFriends = currentFriends.friends.map((friend) =>
				{
					if(Number(friend.id) === Number(payload?.userId))
						return { ...friend, isOnline: payload.isOnline };
					return friend;
				});
				return { ...currentFriends, friends: updatedFriends };
			});
		}
		function handleFriendshipUpdate()
		{
			// SYNC: Friendship changes reload canonical list
			loadFriends();
		}
		socket.on('user:status', handleUserStatus);
		socket.on('friends:update', handleFriendshipUpdate);
		return () =>
		{
			socket.off('user:status', handleUserStatus);
			socket.off('friends:update', handleFriendshipUpdate);
		};
	}, [socket, loadFriends]);

	async function submitAddFriend(event)
	{
		event.preventDefault();

		const friendId = friendIdInput.trim();
		// SAFETY: Empty id cannot become a request
		if (!friendId)
		{
			setFriendsStatus('error');
			setFriendsError('Enter a user id.');
			return;
		}
		setFriendsStatus('loading');
		setFriendsError('');
		try {
			// SYNC: Reload after mutation
			await addFriend(friendId);
			setFriendIdInput('');
			await loadFriends();
		} catch (error) {
			if (error.status === 401 || error.status === 403)
			{
				// SAFETY: Expired sessions bubble to App
				onSessionExpired(error.message);
				return;
			}
			setFriendsStatus('error');
			setFriendsError(error.message);
		}
	}

	async function submitRemoveFriend(friendId)
	{
		setFriendsStatus('loading');
		setFriendsError('');
		try {
			// SYNC: Reload after removal
			await removeFriend(friendId);
			await loadFriends();
		} catch (error) {
			if (error.status === 401 || error.status === 403)
			{
				onSessionExpired(error.message);
				return;
			}
			setFriendsStatus('error');
			setFriendsError(error.message);
		}
	}

	async function submitAcceptFriend(friendId)
	{
		setFriendsStatus('loading');
		setFriendsError('');
		try {
			// SYNC: Reload after accept
			await acceptFriends(friendId);
			await loadFriends();
		} catch (error) {
			if (error.status === 401 || error.status === 403)
			{
				onSessionExpired(error.message);
				return;
			}
			setFriendsStatus('error');
			setFriendsError(error.message);
		}
	}
	return {
		friends,
		friendIdInput,
		setFriendIdInput,
		friendsStatus,
		friendsError,
		loadFriends,
		submitAddFriend,
		submitAcceptFriend,
		submitRemoveFriend,
	};
}
