import { useEffect, useRef } from "react";
import { MAX_CHAT_MESSAGE_LENGTH } from "./useChat";

export function ChatPanel({chat, disabled = false, compact = false, onInputFocusChange})
{
    const { chatInput, setChatInput, chatMessages, chatError, sendChatMessage } = chat;
    const messageRef = useRef(null);
    useEffect(() => {
        const messagesElement = messageRef.current;
        if (messagesElement)
            messagesElement.scrollTop = messagesElement.scrollHeight;
    }, [chatMessages.length]);
    return (
        <section
            className={`room-chat${compact ? ' room-chat--compact' : ''}`}
            aria-label="Room chat"
        >
            <h3>Chat</h3>
            {chatMessages.length === 0 && (
                <p className="room-muted">No messages yet.</p>
            )}
            <ul ref={messageRef} className="room-chat-messages" aria-live="polite">
                {chatMessages.map(chatMessage => (
                    <li
                        key={chatMessage.id ?? `${chatMessage.timestamp}.${chatMessage.author?.id}`}
                    >
                        <span className="room-chat-author">
                            {chatMessage.author?.name || 'Utilisateur supprimé'}:
                        </span>

                        <span className="room-chat-message">
                            {chatMessage.message}
                        </span>
                    </li>
                ))}
            </ul>
            {chatError && (
                <p className="room-error alert alert-danger" role="alert">
                    {chatError}
                </p>
            )}
            <form className="room-chat-form" onSubmit={sendChatMessage}>
                <label className="form-label" htmlFor="room-chat-message">
                    Message
                </label>

                <input
                    id="room-chat-message"
                    className="form-control"
                    type="text"
                    value={chatInput}
                    onChange={event => setChatInput(event.target.value)}
                    onFocus={() => onInputFocusChange?.(true)}
                    onBlur={() => onInputFocusChange?.(false)}
                    placeholder="Write a message"
                    disabled={disabled}
                    maxLength={MAX_CHAT_MESSAGE_LENGTH}
                    autoFocus={compact}
                />

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={disabled || !chatInput.trim()}
                >
                    Send
                </button>
            </form>
        </section>
    );
}
