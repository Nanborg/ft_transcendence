const { createRoom, joinRoom, leaveRoom, leaveAllRooms, getPlayerInRoom, getRoom, setPlayerReady, startGame, setPlayerInput } = require("./rooms");

module.exports = (io) => {
	io.on("connection", (socket) => {
		console.log(`socket connected: ${socket.id}`);

		socket.on("room:create", async ({ roomName } = {}) => {
			try {
				const room = await createRoom(socket.user.id, roomName);
				socket.join(room.id);
				console.log(`room created: ${room.id} by user ${socket.user.id}`);
				socket.emit("room:created", room);
				io.to(room.id).emit("room:update", room);
			} catch (error) {
				socket.emit("room:error", {
					event: "room:create",
					message: error.message,
				});
			}
		});

		socket.on("room:join", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "room:join",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const room = await joinRoom(roomId, socket.user.id);
			//Princiamf2
			// TODO -> return explicit join errors from joinRoom instead of only null.
			// The client should distinguish room not found, room already started, room full, and invalid payload.
			if (!room) {
				socket.emit("room:error", {
					event: "room:join",
					message: "Room not found",
				});
				return;
			}
			socket.join(room.id);
			console.log(`socket ${socket.user.id} joined room ${room.id}`);
			io.to(room.id).emit("room:update", room);
		});

		socket.on("game:start", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "game:start",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const { room, error } = await startGame(roomId, socket.user.id);
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

		socket.on("player:input", async (payload) => {
			if (
				!payload ||
				typeof payload.roomId !== "string" ||
				typeof payload.input !== "object" ||
				payload.input === null
			) {
				socket.emit("room:error", {
					event: "player:input",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId, input } = payload;
			const validKeys = ["up", "down", "left", "right", "action"];
			const hasInvalidKey = Object.keys(input).some((key) => !validKeys.includes(key));
			if (hasInvalidKey) {
				socket.emit("room:error", {
					event: "player:input",
					message: "Invalid input",
				});
				return;
			}
			const { room, error } = await setPlayerInput(roomId, socket.user.id, input);
			if (error) {
				socket.emit("room:error", {
					event: "player:input",
					message: error,
				});
				return;
			}
			//Princiamf2
			// TODO -> forward this validated input to the C++ engine through the Socket.IO backend.
			// The engine should apply inputs in a fixed tick loop, then the frontend should render game:state updates.
			io.to(roomId).emit("player:input", {
				playerId: socket.user.id,
				input: {
					up: input.up === true,
					down: input.down === true,
					left: input.left === true,
					right: input.right === true,
					action: input.action === true,
				},
				timestamp: Date.now(),
			});
		});

		socket.on("room:leave", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "room:leave",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const room = await leaveRoom(roomId, socket.user.id);
			socket.leave(roomId);
			console.log(`socket ${socket.user.id} left room ${roomId}`);
			if (room) {
				io.to(roomId).emit("room:update", room);
			} else {
				//Princiamf2
				// TODO -> notify the leaving socket when the room is deleted.
				// Otherwise the client may keep stale room state after room:leave.
				console.log(`room removed: ${roomId}`);
			}
		});

		socket.on("player:ready", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "player:ready",
					message: "Invalid payload",
				});
				return;
			}
			const { roomId } = payload;
			const room = await setPlayerReady(roomId, socket.user.id);
			if (!room) {
				socket.emit("room:error", {
					event: "player:ready",
					message: "player is not in room",
				});
				return;
			}
			io.to(roomId).emit("room:update", room);
		});

		socket.on("chat:message", async (payload) => {
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
			const room = await getRoom(roomId);
			if (!room) {
				socket.emit("room:error", {
					event: "chat:message",
					message: "Room not found",
				});
				return;
			}
			const player = await getPlayerInRoom(roomId, socket.user.id);
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

		socket.on("disconnect", async () => {
			//Princiamf2
			// TODO -> keep the user in rooms if another socket for the same user is still connected.
			// Closing one tab should not remove an active player from the room or the engine session.
			const { updatedRooms, removedRoomIds } = await leaveAllRooms(socket.user.id);
			
			for (const room of updatedRooms) {
				io.to(room.id).emit("room:update", room);
			}
			for (const roomId of removedRoomIds) {
				io.to(roomId).emit("room:removed", { roomId });
			}
			console.log(`socket disconnected: ${socket.id}`);
		});
	});
};
