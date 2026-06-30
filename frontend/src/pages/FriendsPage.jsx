export function FriendsPage({ title, description, currentUser, friends}) {
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
        <div>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>
            <div className="friends-panel">
                <p>Login first to view your friends.</p>
                <form className="friends-form">
                    <label htmlFor="friend-id">User id</label>
                    <input
                        id="friend-id"
                        type="number"
                        min="1"
                        placeholder="Enter user id"
                    />
                    <button type="submit"> AddFriend </button>
                </form>
                <p className="friends-muted">Loading friends...</p>
                <p className="form-error">Error message</p>
                <p className="friends-muted">No friends yet.</p>
                <ul className="friends-list">
                    <li className="friends-item">
                        <span>Friend username</span>
                        <span className="friends-meta">#1</span>
                        <button type="button"> Remove </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}