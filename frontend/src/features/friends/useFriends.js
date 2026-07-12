import { useCallback, useEffect, useState } from 'react';
import { addFriend, fetchFriends, removeFriend } from '../../api/friends';

export function useFriends(currentUser, accessToken, onSessionExpired) {
    const [friends, setFriends] = useState([]);
    const [friendIdInput, setFriendIdInput] = useState('');
    const [friendsStatus, setFriendsStatus] = useState('idle');
    const [friendsError, setFriendsError] = useState('');

    const loadFriends = useCallback(async () => {
        if (!currentUser || !accessToken) {
            setFriends([]);
            setFriendsStatus('empty');
            setFriendsError('');
            return;
        }
        setFriendsStatus('loading');
        setFriendsError('');

        try {
            const nextFriends = await fetchFriends(accessToken);
            setFriends(nextFriends);
            setFriendsStatus('loaded');
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                onSessionExpired(error.message);
                return;
            }
            setFriends([]);
            setFriendsStatus('error');
            setFriendsError(error.message);
        }
    }, [currentUser, accessToken, onSessionExpired]);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    async function submitAddFriend(event) {
        event.preventDefault();

        const friendId = friendIdInput.trim();
        if (!friendId) {
            setFriendsStatus('error');
            setFriendsError('Enter a user id.');
            return;
        }
        setFriendsStatus('loading');
        setFriendsError('');
        try {
            await addFriend(accessToken, friendId);
            setFriendIdInput('');
            await loadFriends();
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                onSessionExpired(error.message);
                return;
            }
            setFriendsStatus('error');
            setFriendsError(error.message);
        }
    }

    async function submitRemoveFriend(friendId) {
        setFriendsStatus('loading');
        setFriendsError('');
        try {
            await removeFriend(accessToken, friendId);
            await loadFriends();
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
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
        submitRemoveFriend,
    };
}