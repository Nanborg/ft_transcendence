import { useEffect } from 'react';
import { PageHeading } from '../components/PageHeading';

export function LobbyPage({ title, description, currentUser, socket, room, friends, directChat }) {
    const isDisabled = !socket || !currentUser || room.roomStatus === 'loading';
    const friendList = friends?.friends?.friends || [];
    const onlineFriends = friendList.filter(friend => friend.isConnected);
    useEffect(() => {
        if (room.currentRoom) {
            window.location.hash = '#/room';
        }
    }, [room.currentRoom]);
    return (
        <div className="shell-screen shell-screen--lobby">
            <PageHeading
                title={title}
                description={description}
                actions={[{ label: 'Back to Menu', href: '#/' }]}
            />

            <div className="lobby-panel">
                <h2>Lobby terminal</h2>
                {!currentUser && (
                    <p className="lobby-error">Login first to create or join a room.</p>
                )}

                <section className="shell-window shell-window--primary">
                    <h3>Create room</h3>

                    <form className="lobby-form" onSubmit={room.createRoom}>
                        <label className="form-label" htmlFor="lobby-room-name">Room name</label>
                        <input
                            id="lobby-room-name"
                            name="roomName"
                            className="form-control"
                            type="text"
                            value={room.roomNameInput}
                            onChange={event => room.setRoomNameInput(event.target.value)}
                            placeholder="Room name"
                            autoComplete="off"
                            disabled={isDisabled}
                        />
                        <button className="btn btn-success" type="submit" disabled={isDisabled}>
                            Create room
                        </button>
                    </form>
                </section>
                <section className="shell-window">
                    <h3>Join room</h3>

                    <form className="lobby-form" onSubmit={room.joinRoom}>
                        <label className="form-label" htmlFor="lobby-room-id">Room id or name</label>
                        <input
                            id="lobby-room-id"
                            name="roomId"
                            className="form-control"
                            type="text"
                            value={room.roomIdInput}
                            onChange={event => room.setRoomIdInput(event.target.value)}
                            placeholder="Room id or name"
                            autoComplete="off"
                            required
                            disabled={isDisabled}
                        />
                        <button className="btn btn-primary" type="submit" disabled={isDisabled || !room.roomIdInput.trim()}>
                            Join room
                        </button>
                    </form>
                </section>
                <aside className="shell-window lobby-context">
                    <h3>Online friends</h3>
                    {onlineFriends.length === 0 ? (
                        <p className="lobby-muted">No connected friends right now.</p>
                    ) : (
                        <ul className="lobby-friend-list">
                            {onlineFriends.map(friend => (
                                <li key={friend.id}>
                                    <span>{friend.username}</span>
                                    <button
                                        className="btn btn-outline-primary"
                                        type="button"
                                        onClick={() => directChat?.openConversation(friend)}
                                    >
                                        Message
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
            </div>
        </div>
    );
}
