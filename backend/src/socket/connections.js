const connections = new Map();
const RECONNECT_GRACE_PERIOD_MS = 30_000;

function addConnection(userId, socket)
{
	// WHY: Track one active socket per user
	const existingConnection = getConnection(userId);
	const keepReconnectTimer = existingConnection?.keepOnReconnect === true;
	if (existingConnection?.reconnectTimer && !keepReconnectTimer)
		// SYNC: New connection cancels old cleanup
		clearTimeout(existingConnection.reconnectTimer);
	if (existingConnection?.socket && existingConnection.socket.id !== socket.id)
	{
		// DECISION: Latest tab owns the account session
		existingConnection.socket.emit("connection:replaced", {
			message: "This account was opened in another tab or browser.", });
		existingConnection.socket.disconnect(true);
	}
	connections.set(userId,
	{
		socket,
		connectedAt: Date.now(),
		disconnectedAt: keepReconnectTimer ? existingConnection.disconnectedAt : null,
		reconnectTimer: keepReconnectTimer ? existingConnection.reconnectTimer : null,
		keepOnReconnect: keepReconnectTimer,
	});
}

function isOnline(userId)
{
	// SYNC: Friend list reads live socket state
	return connections.get(userId)?.socket?.connected === true;
}

function removeConnection(userId, socketId)
{
	// SAFETY: Only remove matching socket
	const existingConnection = getConnection(userId);

	if (!existingConnection)
		return;
	if (existingConnection.socket.id !== socketId)
		return;

	connections.delete(userId);
}

function getConnection(userId)
{
	// WHY: Shared lookup for socket handlers
	return connections.get(userId);
}

function scheduleDisconnect(userId, socketId, callback, keepOnReconnect = false)
{
	// WHY: Give reconnecting players a grace period
	const connection = getConnection(userId);

	if (!connection || connection.socket.id !== socketId)
		// SAFETY: Ignore stale disconnect events
		return;
	if (connection.reconnectTimer)
		// SYNC: Replace previous pending cleanup
		clearTimeout(connection.reconnectTimer);
	connection.disconnectedAt = Date.now();
	connection.keepOnReconnect = keepOnReconnect;
	connection.reconnectTimer = setTimeout(async () =>
	{
		// SAFETY: Re-check latest connection before cleanup
		const latestConnection = getConnection(userId);
		if (!latestConnection || (!latestConnection.keepOnReconnect && latestConnection.socket.id !== socketId))
			return;
		try {
			await callback();
		} catch (error) {
			console.error( `Reconnect timeout callback failed for user ${userId}:`, error );
		} finally {
			// SYNC: Cleanup timer state after callback
			latestConnection.reconnectTimer = null;
			latestConnection.keepOnReconnect = false;
			latestConnection.disconnectedAt = null;
		}
	}, RECONNECT_GRACE_PERIOD_MS);
}

module.exports = {
	addConnection,
	removeConnection,
	getConnection,
	scheduleDisconnect,
	isOnline
};
