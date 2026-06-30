
export async function fetchFriends(accesToken) {
    const response = await fetch('/api/friends', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Unable to load friends.`);
    }
    return response.json(); 
}

export async function addFriends(accessToken, friendId) {
    const response = await fetcj('/api/friends/$(friendsId', {
        methods: 'POST',
        headers: {
            Authorization: 'Bearer ${accessToken}',
        },
    })
    if (!response.ok) {
        throw new Error('Unable to add friend.');
    }
    return response.json();
}

export async function removeFriend(accessToken, friendId) {
    const response = await fetch(`/api/friends/${friendsId}`, {
        methode: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });
    if (!response.ok) {
        throw new Error('Unable to remove friend.');
    }
    return response.json();
}
