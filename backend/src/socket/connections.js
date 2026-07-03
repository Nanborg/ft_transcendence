const connections = new Map();
const RECONNECT_GRACE_PERIOD_MS = 30_000;
function addConnection(userId, socket) {
    const existingConnection = getConnection(userId);

    if (existingConnection?.reconnectTimer) {
        clearTimeout(existingConnection.reconnectTimer);
    }
    if (existingConnection?.socket && existingConnection.socket.id !== socket.id) {
        existingConnection.socket.emit("connection:replaced", {
            message: "This account was opened in another tab or browser.",
        });
        existingConnection.socket.disconnect(true);
    }
    connections.set(userId, {
        socket,
        connectedAt: Date.now(),
        disconnectedAt: null,
        reconnectTimer: null,
    });
}

function removeConnection(userId, socketId) {
    const existingConnection = getConnection(userId);

    if (!existingConnection) {
        return;
    }
    if (existingConnection.socket.id !== socketId) {
        return;
    }

    connections.delete(userId);
}

function getConnection(userId) {
    return connections.get(userId);
}

function scheduleDisconnect(userId, socketId, callback) {
    const connection = getConnection(userId);

    if (!connection || connection.socket.id !== socketId) {
        return;
    }
    if (connection.reconnectTimer) {
        clearTimeout(connection.reconnectTimer);
    }
    connection.disconnectedAt = Date.now();
    connection.reconnectTimer = setTimeout(async () => {
        const latestConnection = getConnection(userId);
        if (!latestConnection || latestConnection.socket.id !== socketId) {
            return;
        }
        try {
            await callback();
        } catch (error) {
            console.error(
                `Reconnect timeout callback failed for user ${userId}:`,
                error
            );
        } finally {
            latestConnection.reconnectTimer = null;
        }
    }, RECONNECT_GRACE_PERIOD_MS);
}

module.exports = {
    addConnection,
    removeConnection,
    getConnection,
    scheduleDisconnect
};