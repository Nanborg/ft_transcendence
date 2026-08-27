
export async function fetchFriends() {
    const response = await fetch('/api/friends', {
        credentials: 'include',
    });

    if (!response.ok) {
        const error = new Error(
            response.status === 401 || response.status === 403 ? 'Session expired. Login again.' : 'Unable to load friends.',);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

export async function addFriend(friendId) {
    const response = await fetch(`/api/friends/${friendId}`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        const error = new Error('Unable to add friend.');
        error.status = response.status;
        throw error;
    }
    return response.json();
}

export async function removeFriend(friendId) {
    const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!response.ok) {
        const error = new Error('Unable to remove friend.');
        error.status = response.status;
        throw error;
    }

    return response.json();
}
