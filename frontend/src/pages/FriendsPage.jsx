import { PageHeading } from '../components/PageHeading';

export function FriendsPage({ title, description, currentUser, friends }) {
    const {
        friends: friendsData, //test-nico-friends
        friendIdInput,
        setFriendIdInput,
        friendsStatus,
        friendsError,
        submitAddFriend,
        submitAcceptFriend, //test-nico-friends
        submitRemoveFriend,
    } = friends;

    //test-nico-friends-begin
    const friendList = friendsData?.friends || [];
    const pendingReceived = friendsData?.pendingReceived || [];
    const pendingSent = friendsData?.pendingSent || [];
    //test-nico-friends-end
    const isDisabled = friendsStatus === 'loading';

    return (
        <>
            <PageHeading title={title} description={description} /> {/* //test-nico-friends */}

            <div className="friends-panel">
                {!currentUser && (
                    <p className="form-error alert alert-danger">Login first to view your friends.</p>
                )}

                {currentUser && (
                    <>
                        <form className="friends-form" onSubmit={submitAddFriend}>
                            <label className="form-label" htmlFor="friend-id">User id</label>
                            <input
                                id="friend-id"
                                name="friendId"
                                className="form-control"
                                type="number"
                                min="1"
                                value={friendIdInput}
                                onChange={event => setFriendIdInput(event.target.value)}
                                placeholder="Enter user id"
                                autoComplete="off"
                                required
                                disabled={isDisabled}
                            />
                            <button className="btn btn-primary" type="submit" disabled={isDisabled || !friendIdInput.trim()}>
                                Add friend
                            </button>
                        </form>
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
