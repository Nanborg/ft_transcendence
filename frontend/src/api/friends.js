
export async function fetchFriends(accessToken) {
    const response = await fetch('/api/friends', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = new Error(
            response.status === 401 || response.status === 403 ? 'Session expired. Login again.' : 'Unable to load friends.',);
        error.status = response.status;
        throw error;
    }

    return response.json();
}

export async function addFriend(accessToken, friendId) {
    const response = await fetch(`/api/friends/${friendId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        const error = new Error('Unable to add friend.');
        error.status = response.status;
        throw error;
    }
    return response.json();
}

export async function removeFriend(accessToken, friendId) {
    const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        const error = new Error('Unable to remove friend.');
        error.status = response.status;
        throw error;
    }

    return response.json();
}
