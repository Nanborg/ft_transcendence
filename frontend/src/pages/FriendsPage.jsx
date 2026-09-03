import { useEffect, useState } from 'react';
import { PageHeading } from '../components/PageHeading';
import { apiRequest } from '../api/apiReq';
import { addFriend } from '../api/friends';

export function FriendsPage({ title, description, currentUser, friends }) {
    const {
        friends: friendsData, //test-nico-friends
        friendsStatus,
        friendsError,
        submitAcceptFriend, //test-nico-friends
        submitRemoveFriend,
    } = friends;
    const [friendSearchInput, setFriendSearchInput] = useState('');
    const [friendSearchResults, setFriendSearchResults] = useState([]);
    const [friendSearchStatus, setFriendSearchStatus] = useState('idle');
    const [friendSearchError, setFriendSearchError] = useState('');

    //test-nico-friends-begin
    const friendList = friendsData?.friends || [];
    const pendingReceived = friendsData?.pendingReceived || [];
    const pendingSent = friendsData?.pendingSent || [];
    //test-nico-friends-end
    const isDisabled = friendsStatus === 'loading';

    useEffect(() => {
        const search = friendSearchInput.trim();
        if (!currentUser || search.length < 2) {
            setFriendSearchResults([]);
            setFriendSearchStatus('idle');
            setFriendSearchError('');
            return undefined;
        }

        let cancelled = false;
        setFriendSearchStatus('loading');
        setFriendSearchError('');

        const timeoutId = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ search });
                const results = await apiRequest(`/api/users/search?${params.toString()}`, {});
                if (!cancelled) {
                    setFriendSearchResults(results.filter(user => user.id !== currentUser.id));
                    setFriendSearchStatus('loaded');
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }
                setFriendSearchResults([]);
                setFriendSearchStatus(error.status === 404 ? 'loaded' : 'error');
                setFriendSearchError(error.status === 404 ? '' : error.message);
            }
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [currentUser, friendSearchInput]);

    async function submitSearchFriend(friendId) {
        try {
            setFriendSearchError('');
            await addFriend(friendId);
            setFriendSearchInput('');
            setFriendSearchResults([]);
            await friends.loadFriends();
        } catch (error) {
            setFriendSearchError(error.message);
        }
    }

    return (
        <>
            <PageHeading title={title} description={description} /> {/* //test-nico-friends */}

            <div className="friends-panel">
                {!currentUser && (
                    <p className="form-error alert alert-danger">Login first to view your friends.</p>
                )}

                {currentUser && (
                    <>
                        <div className="friends-form">
                            <label className="form-label" htmlFor="friend-search">Search users</label>
                            <input
                                id="friend-search"
                                name="friendSearch"
                                className="form-control"
                                type="search"
                                value={friendSearchInput}
                                onChange={event => setFriendSearchInput(event.target.value)}
                                placeholder="Search by username"
                                autoComplete="off"
                                disabled={isDisabled}
                            />
                            {friendSearchStatus === 'loading' && (<p className="friends-muted">Searching...</p>)}
                            {friendSearchError && (<p className="form-error alert alert-danger" role="alert">{friendSearchError}</p>)}
                            {friendSearchInput.trim().length >= 2 && friendSearchStatus === 'loaded' && friendSearchResults.length === 0 && (
                                <p className="friends-muted">No users found.</p>
                            )}
                            {friendSearchResults.length > 0 && (
                                <ul className="friends-list">
                                    {friendSearchResults.map(user => (
                                        <li key={user.id} className="friends-item">
                                            <span>{user.username}</span>
                                            <span className="friends-meta badge text-bg-info">#{user.id}</span>
                                            <button className="btn btn-primary" type="button" onClick={() => submitSearchFriend(user.id)} disabled={isDisabled}>
                                                Add
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {friendsStatus === 'loading' && (<p className="friends-muted alert alert-info">Loading friends...</p>)}
                        {friendsError && (<p className="form-error alert alert-danger" role="alert">{friendsError}</p>)}
                        {/* //test-nico-friends-begin */}
                        {pendingReceived.length > 0 && (
                            <>
                                <h2 className="h5 mt-4">Friend requests</h2>
                                <ul className="friends-list">
                                    {pendingReceived.map(friend => (
                                        <li key={friend.id} className="friends-item">
                                            <span>{friend.username}</span>
                                            <span className="friends-meta badge text-bg-info">#{friend.id}</span>
                                            <button className="btn btn-outline-success" type="button" onClick={() => submitAcceptFriend(friend.id)} disabled={isDisabled}>
                                                Accept
                                            </button>
                                            <button className="btn btn-outline-warning" type="button" onClick={() => submitRemoveFriend(friend.id)} disabled={isDisabled}>
                                                Decline
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {pendingSent.length > 0 && (
                            <>
                                <h2 className="h5 mt-4">Sent requests</h2>
                                <ul className="friends-list">
                                    {pendingSent.map(friend => (
                                        <li key={friend.id} className="friends-item">
                                            <span>{friend.username}</span>
                                            <span className="friends-meta badge text-bg-secondary">Pending</span>
                                            <button className="btn btn-outline-warning" type="button" onClick={() => submitRemoveFriend(friend.id)} disabled={isDisabled}>
                                                Cancel
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {/* //test-nico-friends-end */}
                        <h2 className="h5 mt-4">Friends</h2> {/* //test-nico-friends */}
                        {friendList.length === 0 && friendsStatus !== 'loading' ? (<p className="friends-muted">No friends yet.</p>) : (
                            <ul className="friends-list">
                                {friendList.map(friend => (
                                    <li key={friend.id} className="friends-item">
                                        <span>{friend.username}</span>
                                        <span className="friends-meta badge text-bg-info">#{friend.id}</span>
                                        <button
                                            className="btn btn-outline-warning"
                                            type="button"
                                            onClick={() => submitRemoveFriend(friend.id)}
                                            disabled={isDisabled}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
