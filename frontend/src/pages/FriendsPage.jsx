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
            <p>FrontendPage</p>
            <h1>Friends</h1>
            <p>View your Friends</p>
            <div>
                <p>Login first to view your friends.</p>
                <form>
                    <label htmlFor="friend-id">User id</label>
                    <input
                        id="friend-id"
                        type="number"
                        min="1"
                        placeholder="Enter user id"
                    />
                    <button type="submit"> AddFriend </button>
                </form>
                <p>Loading friends...</p>
                <p>Error message</p>
                <p>No friends yet.</p>
                <ul>
                    <li>
                        <span>Friend username</span>
                        <span>#1</span>
                        <button type="button"> Remove </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}