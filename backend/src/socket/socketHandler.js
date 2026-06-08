const { createRoom, joinRoom, leaveRoom, leaveAllRooms, getPlayerInRoom, getRoom, setPlayerReady, startGame } = require("./rooms");

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

		socket.on("room:join", (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "room:join",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId, playerName } = payload;
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

		socket.on("game:start", (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "game:start",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const { room, error } = startGame(roomId, socket.id);
			if (error) {
				socket.emit("room:error", {
					event: "game:start",
					message: error,
				});
				return;
			}
			io.to(roomId).emit("room:update", room);
			io.to(roomId).emit("game:start", {
				roomId: room.id,
				status: room.status,
				players: room.players,
				timestamp: Date.now(),
			});
			console.log(`game starting in room ${room.id}`);
		});

		socket.on("room:leave", (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "room:leave",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const room = leaveRoom(roomId, socket.id);
			socket.leave(roomId);
			console.log(`socket ${socket.id} left room ${roomId}`);
			if (room) {
				io.to(roomId).emit("room:update", room);
			} else {
				console.log(`room removed: ${roomId}`);
			}
		});

		socket.on("player:ready", (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "player:ready",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const room = setPlayerReady(roomId, socket.id);
			if (!room) {
				socket.emit("room:error", {
					event: "player:ready",
					message: "player is not in room",
				});
				return;
			}
			io.to(roomId).emit("room:update", room);
		});

		socket.on("chat:message", (payload) => {
			if (!payload ||
				typeof payload.roomId !== "string" ||
				typeof payload.message !== "string"
			) {
				socket.emit("room:error", {
					event: "chat:message",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId, message } = payload;
			if (!message || !message.trim()) {
				socket.emit("room:error", {
					event: "chat:message",
					message: "Message cannot be empty",
				});
				return;
			}
			const room = getRoom(roomId);
			if (!room) {
				socket.emit("room:error", {
					event: "chat:message",
					message: "Room not found",
				});
				return;
			}
			const player = getPlayerInRoom(roomId, socket.id);
			if (!player) {
				socket.emit("room:error", {
					event: "chat:message",
					message: "Player is not in room",
				});
				return;
			}
			const chatMessage = {
				author: {
					id: player.id,
					name: player.name,
				},
				message: message.trim(),
				timestamp: Date.now(),
			};
			io.to(roomId).emit("chat:message", chatMessage);
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
