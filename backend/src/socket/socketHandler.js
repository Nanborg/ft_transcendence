const { createRoom, joinRoom, leaveRoom, leaveAllRooms } = require("./rooms");

module.exports = (io) => {
	io.on("connection", (socket) => {
		console.log(`socket connected: ${socket.id}`);

		socket.on("room:create", ({ playerName } = {}) => {
			const room = createRoom(socket.id, playerName);
			socket.join(room.id);
			console.log(`room created: ${room.id} by ${socket.id}`);
			socket.emit("room:created", room);
			io.to(room.id).emit("room:update", room);
		});

		socket.on("room:join", ({ roomId, playerName }) => {
			const room = joinRoom(roomId, socket.id, playerName);
			if (!room) {
				socket.emit("room:error", {
					event: "room:join",
					message: "Room not found",
				});
				return;
			}
			socket.join(room.id);
			console.log(`socket ${socket.id} joined room ${room.id}`);
			io.to(room.id).emit("room:update", room);
		});

		socket.on("room:leave", ({ roomId }) => {
			const room = leaveRoom(roomId, socket.id);
			socket.leave(roomId);
			console.log(`socket ${socket.id} left room ${roomId}`);
			if (room) {
				io.to(roomId).emit("room:update", room);
			} else {
				console.log(`room removed: ${roomId}`);
			}
		});

		socket.on("disconnect", (reason) => {
			const { updatedRooms, removedRoomIds } = leaveAllRooms(socket.id);
			updatedRooms.forEach((room) => {
				io.to(room.id).emit("room:update", room);
			});
			removedRoomIds.forEach((roomId) => {
				console.log(`room removed: ${roomId}`);
			});
			console.log(`socket disconnected: ${socket.id} reason=${reason}`);
		});
	});
};
