import './mobileGameChat.css';
import { useChatAutoScroll } from './useChatAutoScroll';

export function MobileGameChat({roomMessages = [], privateMessages = []})
{
    const messages = [
        ...roomMessages.slice(-3).map(message => ({...message, channel: 'room'})),
        ...privateMessages.slice(-3).map(message => ({...message, channel: 'private'})),
    ]
        .filter(message => typeof message.message === 'string')
        .sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0))
        .slice(-3);

    const messageRef = useChatAutoScroll(messages);

    if (messages.length === 0)
        return null;

    return (
        <aside ref={messageRef} className="mobile-game-chat" role="log" aria-label="Messages reçus" aria-live="polite">
            {messages.map(message => (
                <p
                    key={`${message.channel}:${message.id ?? `${message.timestamp}:${message.author?.id}:${message.message}`}`}
                    className={`mobile-game-chat-message mobile-game-chat-message--${message.channel}`}
                >
                    <strong>
                        [{message.channel === 'room' ? 'Room' : 'Privé'}] {message.author?.name || 'Utilisateur supprimé'} :
                    </strong>{' '}
                    {message.message}
                </p>
            ))}
        </aside>
    );
}
