function formatExpiration(expiresAt)
{
    const expirationDate = new Date(Number(expiresAt));
    if (Number.isNaN(expirationDate.getTime()))
        return '';
    return expirationDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getInvitationStatusLabel(status)
{
    switch (status)
    {
        case 'PENDING':
            return 'Waiting for response';
        case 'ACCEPTED':
            return 'Invitation accepted';
        case 'DECLINED':
            return 'Invitation declined';
        case 'EXPIRED':
            return 'Invitation expired';
        case 'CANCELLED':
            return 'Invitation cancelled';
        default:
            return status || 'Unknown status';
    }
}

export function InvitationPanel({currentUser, directChat,})
{
    const {invitations, respondToInvitation,} = directChat;

    if (invitations.length === 0)
    {
        return (
            <section className="chat-invitations">
                <h3>Game invitations</h3>

                <p className="room-muted">
                    No invitations.
                </p>
            </section>
        );
    }

    return (
        <section
            className="chat-invitations"
            aria-label="Game invitations"
        >
            <h3>Game invitations</h3>

            <ul className="chat-invitation-list">
                {invitations.map(message => {
                    const invitation = message.invitation;
                    if (!invitation)
                        return null;
                    const isOutgoing =
                        Number(message.author?.id) ===
                        Number(currentUser?.id);
                    const otherUser = isOutgoing
                        ? message.recipient
                        : message.author;
                    const roomName =
                        invitation.room?.name ||
                        invitation.room?.id ||
                        'Unavailable room';
                    return (
                        <li
                            key={invitation.id}
                            className="chat-invitation-card"
                        >
                            <div className="chat-invitation-details">
                                <strong>
                                    {isOutgoing
                                        ? `Invitation sent to ${otherUser?.name || 'Deleted user'}`
                                        : `${otherUser?.name || 'Deleted user'} invited you`}
                                </strong>

                                <span>
                                    Room: <strong>{roomName}</strong>
                                </span>

                                {invitation.expiresAt &&
                                    invitation.status === 'PENDING' && (
                                        <small>
                                            Expires at{' '}
                                            {formatExpiration(invitation.expiresAt)}
                                        </small>
                                    )}
                            </div>

                            {!isOutgoing &&
                                invitation.status === 'PENDING' ? (
                                    <div className="chat-invitation-actions">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() =>
                                                respondToInvitation(invitation.id, 'ACCEPTED')
                                            }
                                        >
                                            Accept
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() =>
                                                respondToInvitation(invitation.id, 'DECLINED')
                                            }
                                        >
                                            Decline
                                        </button>
                                    </div>
                                ) : (
                                    <strong
                                        className={`chat-invitation-status ` +`chat-invitation-status--${invitation.status.toLowerCase()}`}>
                                        {getInvitationStatusLabel(
                                            invitation.status
                                        )}
                                    </strong>
                                )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}