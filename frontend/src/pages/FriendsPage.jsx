import { PageHeading } from '../components/PageHeading';

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
<PageHeading title={title} description={description} />

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
                                className="form-control"
                                type="number"
                                min="1"
                                value={friendIdInput}
                                onChange={event => setFriendIdInput(event.target.value)}
                                placeholder="Enter user id"
                                disabled={isDisabled}
                            />
                            <button className="btn btn-primary" type="submit" disabled={isDisabled || !friendIdInput.trim()}>
                                Add friend
                            </button>
                        </form>
                        {friendsStatus === 'loading' && (<p className="friends-muted alert alert-info">Loading friends...</p>)}
                        {friendsError && (<p className="form-error alert alert-danger" role="alert">{friendsError}</p>)}
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
