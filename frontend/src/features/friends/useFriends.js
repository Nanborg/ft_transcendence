import { useCallback, useEffect, useState } from 'react';
import { acceptFriends, addFriend, fetchFriends, removeFriend } from '../../api/friends'; //test-nico-friends

export function useFriends(currentUser, onSessionExpired) {
    const [friends, setFriends] = useState([]);
    const [friendIdInput, setFriendIdInput] = useState('');
    const [friendsStatus, setFriendsStatus] = useState('idle');
    const [friendsError, setFriendsError] = useState('');

    const loadFriends = useCallback(async () => {
        if (!currentUser) {
            setFriends([]);
            setFriendsStatus('empty');
            setFriendsError('');
            return;
        }
        setFriendsStatus('loading');
        setFriendsError('');

        try {
            const nextFriends = await fetchFriends();
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
    }, [currentUser, onSessionExpired]);

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
            await addFriend(friendId);
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
            await removeFriend(friendId);
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

    //test-nico-friends-begin
    async function submitAcceptFriend(friendId) {
        setFriendsStatus('loading');
        setFriendsError('');
        try {
            await acceptFriends(friendId);
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
    //test-nico-friends-end
    return {
        friends,
        friendIdInput,
        setFriendIdInput,
        friendsStatus,
        friendsError,
        loadFriends,
        submitAddFriend,
        submitAcceptFriend, //test-nico-friends
        submitRemoveFriend,
    };
}
