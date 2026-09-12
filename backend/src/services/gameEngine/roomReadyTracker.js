class RoomReadyTracker
{
    constructor(timeoutMs)
    {
        this.timeoutMs = timeoutMs;
        this.pending = new Map();
    }

    wait(roomId)
    {
        const pendingEntry = this.pending.get(roomId);
        if (pendingEntry)
            return pendingEntry.promise;
        let resolveRoomReady;
        let rejectRoomReady;
        const promise = new Promise((resolve, reject) =>
        {
            resolveRoomReady = resolve;
            rejectRoomReady = reject;
        });
        this.pending.set(roomId, {
            promise,
            resolve: resolveRoomReady,
            reject: rejectRoomReady,
        });
        setTimeout(() =>
        {
            const error = new Error(`Timed out waiting for roomReady for room ${roomId}`);
            error.code = 'ROOM_READY_TIMEOUT';
            this.reject(roomId, error);
        }, this.timeoutMs);
        return promise;
    }

    resolve(roomId, message)
    {
        const pendingEntry = this.pending.get(roomId);
        if (!pendingEntry)
            return false;
        this.pending.delete(roomId);
        pendingEntry.resolve(message);
        return true;
    }

    reject(roomId, error)
    {
        const pendingEntry = this.pending.get(roomId);
        if (!pendingEntry)
            return false;
        this.pending.delete(roomId);
        pendingEntry.reject(error);
        return true;
    }
}

module.exports = { RoomReadyTracker };
