import { useEffect } from 'react';
import { PageHeading } from '../components/PageHeading';

export function LobbyPage({ title, description, currentUser, socket, room }) {
    const isDisabled = !socket || !currentUser || room.roomStatus === 'loading';
    useEffect(() => {
        if (room.currentRoom) {
            window.location.hash = '#/room';
        }
    }, [room.currentRoom]);
    return (
        <>
            <PageHeading title={title} description={description} />

            <div className="lobby-panel">
                <h2>Enter a room</h2>
                {!currentUser && (
                    <p className="lobby-error">Login first to create or join a room.</p>
                )}

                <section>
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
                <section>
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
            </div>
        </>
    );
}
