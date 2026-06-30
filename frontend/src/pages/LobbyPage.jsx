export function LobbyPage({ title, description, currentUser, socket, room }) {
    const isDisabled = !socket || !currentUser || room.roomStatus === 'loading';
    return (
        <>
            <p className="page-kicker">Frontend page</p>
            <h1 id="page-title">{title}</h1>
            <p>{description}</p>

            <div className="lobby-panel">
                <h2>Enter a room</h2>
                {!currentUser && (
                    <p className="lobby-error">Login first to create or join a room.</p>
                )}

                <section>
                    <h3>Create room</h3>

                    <form className="lobby-form" onSubmit={room.createRoom}>
                        <label htmlFor="lobby-room-name">Room name</label>
                        <input
                            id="lobby-room-name"
                            type="text"
                            value={room.roomNameInput}
                            onChange={event => room.setRoomNameInput(event.target.value)}
                            placeholder="Room name"
                            disabled={isDisabled}
                        />
                        <button type="submit" disabled={isDisabled}>
                            Create room
                        </button>
                    </form>
                </section>
                <section>
                    <h3>Join room</h3>

                    <form className="lobby-form" onSubmit={room.joinRoom}>
                        <label htmlFor="lobby-room-id">Room id or name</label>
                        <input
                            id="lobby-room-id"
                            type="text"
                            value={room.roomIdInput}
                            onChange={event => room.setRoomIdInput(event.target.value)}
                            placeholder="Room id or name"
                            disabled={isDisabled}
                        />
                        <button type="submit" disabled={isDisabled || !room.roomIdInput.trim()}>
                            Join room
                        </button>
                    </form>
                </section>
            </div>
        </>
    );
}