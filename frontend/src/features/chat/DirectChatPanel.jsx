import { MAX_CHAT_MESSAGE_LENGTH } from './useChat';
import { useEffect, useState } from 'react';
import { PublicProfilePanel } from './PublicProfilePanel';

function formatMessageTime(timestamp)
{
    const date = new Date(Number(timestamp));

    if (Number.isNaN(date.getTime()))
        return '';
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function DirectChatPanel({
    currentUser,
    currentRoom,
    directChat,
    onInputFocusChange,
})
{
    const {
        conversations,
        selectedUser,
        directMessages,
        directInput,
        setDirectInput,
        directError,
        blockedUsers,
        isSelectedUserBlocked,
        openConversation,
        closeConversation,
        sendDirectMessage,
        sendGameInvitation,
        blockSelectedUser,
        unblockSelectedUser,
    } = directChat;

    const [isProfileOpen, setIsprofileOpen] = useState(false);
    useEffect(() => {
        setIsprofileOpen(false);
    }, [selectedUser?.id]);
    if (selectedUser && isProfileOpen)
    {
        return (
            <PublicProfilePanel
                user={selectedUser}
                onBack={() => setIsprofileOpen(false)}
            />
        );
    }
    if (!selectedUser)
    {
        return (
            <div className="direct-chat-panel direct-chat-panel--compact">
                <h3>Private conversations</h3>

                {conversations.length === 0 && (
                    <p className="room-muted">
                        No private conversations yet.
                    </p>
                )}

                <ul className="direct-chat-conversations">
                    {conversations.map(conversation => (
                        <li key={conversation.user.id}>
                            <button
                                type="button"
                                className="direct-chat-conversation"
                                onClick={() =>
                                    openConversation(conversation.user)
                                }
                            >
                                <span>{conversation.user.name}</span>

                                {conversation.unreadCount > 0 && (
                                    <span className="badge text-bg-info">
                                        {conversation.unreadCount}
                                    </span>
                                )}

                                <small>
                                    {conversation.lastMessage.message}
                                </small>
                            </button>
                        </li>
                    ))}
                </ul>

                {blockedUsers.length > 0 && (
                    <>
                        <h3>Blocked users</h3>

                        <ul className="direct-chat-blocked-users">
                            {blockedUsers.map(user => (
                                <li key={user.id}>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            openConversation(user)
                                        }
                                    >
                                        {user.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        );
    }

    return (
        <section
            className="direct-chat-panel direct-chat-panel--compact"
            aria-label={`Private conversation with ${selectedUser.name}`}
        >
            <header className="direct-chat-header">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                        onInputFocusChange?.(false);
                        closeConversation();
                    }}
                    aria-label="Back to conversations"
                >
                    Back
                </button>

                <div>
                    <h3>
                        <button
                            type="button"
                            className="direct-chat-profile-button"
                            onClick={() => setIsprofileOpen(true)}
                            aria-label={`View ${selectedUser.name}'s profile`}
                        >
                            {selectedUser.name}
                        </button>
                    </h3>
                    <span>#{selectedUser.id}</span>
                </div>

                <div className="direct-chat-header-actions">
                    {currentRoom?.id &&
                        currentRoom.status === 'waiting' &&
                        !isSelectedUserBlocked && (
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => sendGameInvitation(currentRoom.id)}
                            >
                                Invite
                            </button>
                        )}

                    {isSelectedUserBlocked ? (
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={unblockSelectedUser}
                        >
                            Unblock
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={blockSelectedUser}
                        >
                            Block
                        </button>
                    )}
                </div>
            </header>

            <ul
                className="direct-chat-messages"
                aria-live="polite"
            >
                {directMessages.length === 0 && (
                    <li className="room-muted">
                        No messages yet.
                    </li>
                )}

                {directMessages.map(message => {
                    const isOwnMessage =
                        Number(message.author?.id) ===
                        Number(currentUser?.id);

                    return (
                        <li
                            key={message.id}
                            className={
                                isOwnMessage
                                    ? 'direct-chat-message direct-chat-message--own'
                                    : 'direct-chat-message'
                            }
                        >
                            <strong>
                                {isOwnMessage
                                    ? 'You'
                                    : message.author?.name ||
                                      'Deleted user'}
                            </strong>

                            <span>{message.message}</span>

                            <time>
                                {formatMessageTime(message.timestamp)}
                            </time>
                        </li>
                    );
                })}
            </ul>

            {directError && (
                <p className="alert alert-danger" role="alert">
                    {directError}
                </p>
            )}

            <form
                className="direct-chat-form"
                onSubmit={sendDirectMessage}
            >
                <label
                    className="visually-hidden"
                    htmlFor="private-chat-message"
                >
                    Private message
                </label>

                <input
                    id="private-chat-message"
                    className="form-control"
                    type="text"
                    value={directInput}
                    onChange={event =>
                        setDirectInput(event.target.value)
                    }
                    onFocus={() => onInputFocusChange?.(true)}
                    onBlur={() => onInputFocusChange?.(false)}
                    maxLength={MAX_CHAT_MESSAGE_LENGTH}
                    disabled={isSelectedUserBlocked}
                    placeholder={
                        isSelectedUserBlocked
                            ? 'Unblock this user to send messages'
                            : 'Write a private message'
                    }
                />

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={
                        isSelectedUserBlocked ||
                        !directInput.trim()
                    }
                >
                    Send
                </button>
            </form>
        </section>
    );
}
