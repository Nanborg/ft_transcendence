import {useEffect, useState } from 'react';
import { addFriends, fetchFriends, removeFriend } from '../../api/friends';

export function useFriends(currentUser, accesToken)
{
    const [friends, setFriends] = useState([]);
    const [friendsIdInput, setFriendsIdInput] = useState('');
    const [friendsStatus, setFriendsStatus] = useState('idle');
    const [friendsError, setFriendsError] = useState('');

    async function loadFriends() {
        if (!currentUser || !accesToken) {
            setFriends([]);
            setFriendsStatus('empty');
            return;
        }
        setFriendsStatus('loading');
        setFriendsError('');

        try {
            const nextFriends = await fetchFriends(accesToken);
            setFriends(nextFriends);
            setFriendsStatus('loaded');
        } catch (error) {
            setFriends([]);
            setFriendsStatus('error');
            setFriendsError(error.message);
        }
    }

    useEffect(() => {
        loadFriends();
    }, [currentUser, accesToken]);

    async function submitAddFriend(event) {
        event.preventDefault();

        const friendId = friendsIdInput.trim();
        if (!friendId) {
            setFriendsError('Enter a user id');
            return;
        }
        setFriendsStatus('loading');
        setFriendsError('');
        try {
            await addFriends(accesToken, friendId);
            setFriendsIdInput('');
            await loadFriends();
        } catch (error) {
            setFriendsStatus('error');
            setFriendsError(error.message);
        }
    }
    
    async function submitRemoveFriens(friendId) {
        setFriendsStatus('loading');
        setFriendsError('');
        try {
            await removeFriend(accesToken, friendId);
            await loadFriends();
        } catch (error) {
            setFriendsStatus('error');
            setFriendsError(error.message);
        }
    }
    return {
        friends,
        friendsIdInput,
        setFriendsIdInput,
        friendsStatus,
        friendsError,
        loadFriends,
        submitAddFriend,
        submitRemoveFriens,
    };
}