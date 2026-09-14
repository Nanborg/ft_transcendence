function formatExpiration(expiresAt)
{
	const expirationDate = new Date(Number(expiresAt));
	if (Number.isNaN(expirationDate.getTime()))
		return '';
	return expirationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', });
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

export function InvitationPanel({currentUser, directChat, friends})
{
	const {invitations, respondToInvitation,} = directChat;
	const { friends: friendsData, friendsStatus, friendsError, submitAcceptFriend, submitRemoveFriend } = friends;
	const pendingFriendRequests = friendsData?.pendingReceived ?? [];
	const pendingSentFriendRequests = friendsData?.pendingSent ?? [];
	const isFriendActionLoading = friendsStatus === 'loading';

	return (
		<section
			className="chat-invitations"
			aria-label="Notifications"
		>
			<h3>Friend requests</h3>

			{friendsError && (
				<p className="alert alert-danger" role="alert">
					{friendsError}
				</p>
			)}
			{pendingFriendRequests.length === 0 ? (
				<p className="room-muted">
					No friend requests.
				</p>
			) : (
				<ul className="chat-invitation-list">
					{pendingFriendRequests.map(friend => (
						<li
							key={friend.id}
							className="chat-invitation-card"
						>
							<div className="chat-invitation-details">
								<strong>
									{friend.username} sent you a friend request
								</strong>
								<span>
									User #{friend.id}
								</span>
							</div>
							<div className="chat-invitation-actions">
								<button
									type="button"
									className="btn btn-primary"
									disabled={isFriendActionLoading}
									onClick={() => submitAcceptFriend(friend.id)}
								>
									Accept
								</button>
								<button
									type="button"
									className="btn btn-outline-danger"
									disabled={isFriendActionLoading}
									onClick={() => submitRemoveFriend(friend.id)}
								>
									Decline
								</button>
							</div>
						</li>
					))}
				</ul>
			)}

			<h3>Sent friend request</h3>
			{pendingSentFriendRequests.length === 0 ? (
				<p className="room-muted">
					No sent friend requests.
				</p>
			) : (
				<ul className="chat-invitation-list">
					{pendingSentFriendRequests.map(friend => (
						<li
							key={friend.id}
							className="chat-invitation-card"
						>
							<div className="chat-invitation-details">
								<strong>
									Friend request sent to {friend.username}
								</strong>
								<span>
									User #{friend.id}
								</span>
							</div>
							<strong className="chat-invitation-status">
								Waiting for response
							</strong>
						</li>
					))}
				</ul>
			)}

			<h3>Game invitations</h3>

			{invitations.length === 0 && (
				<p className="room-muted">
					No game invitations.
				</p>
			)}

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
