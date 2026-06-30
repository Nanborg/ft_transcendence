export function FriendsPage({ title, description, currentUser, friends }) {
    const {
        friends: friendList,
        friendIdInput,
        setFriendIdInput,
        friendsStatus,
        friendsError,
        submitAddFriend,
        submitRemoveFriend,
    } = friends;

    const isDisabled = friendsStatus === 'loading';

    return (
        <>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>

            <div className="friends-panel">
                {!currentUser && (
                    <p className="form-error">Login first to view your friends.</p>
                )}

                {currentUser && (
                    <>
                        <form className="friends-form" onSubmit={submitAddFriend}>
                            <label htmlFor="friend-id">User id</label>
                            <input
                                id="friend-id"
                                type="number"
                                min="1"
                                value={friendIdInput}
                                onChange={event => setFriendIdInput(event.target.value)}
                                placeholder="Enter user id"
                                disabled={isDisabled}
                            />
                            <button type="submit" disabled={isDisabled || !friendIdInput.trim()}>
                                Add friend
                            </button>
                        </form>
                        {friendsStatus === 'loading' && (<p className="friends-muted">Loading friends...</p>)}
                        {friendsError && (<p className="form-error" role="alert">{friendsError}</p>)}
                        {friendList.length === 0 && friendsStatus !== 'loading' ? (<p className="friends-muted">No friends yet.</p>) : (
                            <ul className="friends-list">
                                {friendList.map(friend => (
                                    <li key={friend.id} className="friends-item">
                                        <span>{friend.username}</span>
                                        <span className="friends-meta">#{friend.id}</span>
                                        <button
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