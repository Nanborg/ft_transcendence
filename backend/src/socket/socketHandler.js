const { createRoom, joinRoom, leaveRoom, leaveAllRooms, getPlayerInRoom, getRoom, setPlayerReady, startGame, setPlayerInput, getRoomsByUserId, resetGameStart } = require("./rooms");
const { addConnection, removeConnection, getConnection, scheduleDisconnect } = require("./connections");
const { gameEngineService } = require("../services/gameEngineService");

//Princiamf2
// TODO(princiamf2): Add Socket.IO tests for room lifecycle, gameplay events,
// invalid payloads, disconnects, and multi-room isolation.
// These tests should cover create, join, ready, start, input, state, end,
// leave, reconnect, and room deletion.
module.exports = (io) => {
	gameEngineService.on("entityUpdate", (message) => {
		if (
			!message ||
			typeof message.room !== "string" ||
			typeof message.entity !== "object" ||
			message.entity === null
		) {
			console.error(
				"Invalid entityUpdate received from game engine:",
				message
			);
			return;
		}
		io.to(message.room).emit("game:entity:update", {
			roomId: message.room,
			tick: message.tick,
			entity: message.entity,
			timestamp: Date.now(),
		});
	});
	gameEngineService.on("entityDelete", (message) => {
		if (
			!message ||
			typeof message.room !== "string" ||
			typeof message.entity !== "object" ||
			message.entity === null
		) {
			console.error(
				"Invalid entityDelete received from game engine:",
				message
			);
			return;
		}
		io.to(message.room).emit("game:entity:delete", {
			roomId: message.room,
			tick: message.tick,
			entity: message.entity,
			timestamp: Date.now(),
		});
	});
	io.on("connection", async (socket) => {
		console.log(`socket connected: ${socket.id}`);
		addConnection(socket.user.id, socket);
		const existingRoom = await getRoomsByUserId(socket.user.id);

		for (const room of existingRoom) {
			socket.join(room.id);
			socket.emit("room:update", room);
			io.to(room.id).emit("room:update", room);
		}

		socket.on("room:create", async ({ roomName } = {}) => {
			try {
				const { room, error } = await createRoom(socket.user.id, roomName);
				if (error) {
					socket.emit("room:error", {
						event: "room:create",
						code: error.code,
						message: error.message,
					});
					return;
				}
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
					code: "INVALID_PAYLOAD",
					message: "Invalid payload",
				});
				return;
			}
			try {
				const { roomId } = payload;
				const { room, error } = await joinRoom(roomId, socket.user.id);
				if (error) {
					socket.emit("room:error", {
						event: "room:join",
						code: error.code,
						message: error.message,
					});
					return;
				}
				socket.join(room.id);
				console.log(`socket ${socket.user.id} joined room ${room.id}`);
				io.to(room.id).emit("room:update", room);
			} catch (error) {
				socket.emit("room:error", {
					event: "room:join",
					message: error.message,
				});
			}
		});

		// TODO: Relay engine entityUpdate, entityDelete, and gameEnd messages
		// to the correct Socket.IO room.
		socket.on("game:start", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "game:start",
					message: "Invalid payload",
				});
				return;
			}
			try {
				const { roomId } = payload;
				const { room, error } = await startGame(roomId, socket.user.id);
				if (error) {
					socket.emit("room:error", {
						event: "game:start",
						message: error,
					});
					return;
				}
				let engineSession;

				try {
					engineSession = await gameEngineService.startGame(room);
				} catch (error) {
					console.error("Unable to start game engine session:", error);
					const restoredRoom = await resetGameStart(roomId);
					io.to(roomId).emit("room:update", restoredRoom);
					socket.emit("room:error", {
						event: "game:start",
						code: "GAME_ENGINE_START_FAILED",
						message: "Unable to start the game engine",
					});
					return;
				}

				io.to(roomId).emit("room:update", room);
				// TODO(princiamf2): Map engine game_state to Socket.IO game:state
				// and add timestamp at relay time while preserving engine tick.
				// TODO(princiamf2): Map engine game_end to Socket.IO game:end.
				// TODO(yaoberso): Persist trusted game:end results into GameRun
				// and PlayerRunStats after server-side validation.
				io.to(roomId).emit("game:start", {
					roomId: room.id,
					status: room.status,
					players: room.players,
					enginePlayers: engineSession.players,
					timestamp: Date.now(),
				});
				console.log(`game starting in room ${room.id}`);
			} catch (error) {
				socket.emit("room:error", {
					event: "game:start",
					message: error.message,
				});
			}
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
			try {
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
				try {
					await gameEngineService.sendPlayerInput(
						roomId,
						socket.user.id,
						input
					);
				} catch (error) {
					console.error("Unable to send player input to game engine:", error);
					socket.emit("room:error", {
						event: "player:input",
						message: "Game engine unavailable",
					});
					return;
				}
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
			} catch (error) {
				socket.emit("room:error", {
					event: "player:input",
					message: error.message,
				});
			}
		});

		socket.on("room:leave", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "room:leave",
					message: "Invalid payload",
				});
				return;
			}
			try {
				const { roomId } = payload;
				try {
					await gameEngineService.removePlayer(roomId, socket.user.id);
				} catch (error) {
					console.error("Unable to remove player from game engine", error);
				}
				const room = await leaveRoom(roomId, socket.user.id);
				socket.leave(roomId);
				console.log(`socket ${socket.user.id} left room ${roomId}`);
				if (room) {
					io.to(roomId).emit("room:update", room);
				} else {
					io.to(roomId).emit("room:removed", { roomId });
					console.log(`room removed: ${roomId}`);
				}
			} catch (error) {
				socket.emit("room:error", {
					event: "room:leave",
					message: error.message,
				});
			}
		});

		socket.on("player:ready", async (payload) => {
			if (!payload || typeof payload.roomId !== "string") {
				socket.emit("room:error", {
					event: "player:ready",
					code: "INVALID_PAYLOAD",
					message: "Invalid payload",
				});
				return;
			}
			try {
				const { roomId } = payload;
				const result = await setPlayerReady(roomId, socket.user.id);
				if (!result) {
					socket.emit("room:error", {
						event: "player:ready",
						code: "PLAYER_NOT_IN_ROOM",
						message: "Player is not in room",
					});
					return;
				}
				const { room, error } = result;
				if (error) {
					socket.emit("room:error", {
						event: "player:ready",
						code: error.code,
						message: error.message,
					});
					return;
				}
				io.to(roomId).emit("room:update", room);
			} catch (error) {
				socket.emit("room:error", {
					event: "player:ready",
					message: error.message,
				});
			}
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
			try {
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
			} catch (error) {
				socket.emit("room:error", {
					event: "chat:message",
					message: error.message,
				});
			}
		});

		socket.on("disconnect", () => {
			try {
				// TODO(princiamf2): Define in-game disconnect behavior
				// (forfeit, end game, or keep room alive during reconnect window).
				scheduleDisconnect(
					socket.user.id,
					socket.id,
					async () => {
						const userRooms = await getRoomsByUserId(socket.user.id);
						for (const room of userRooms) {
							try {
								await gameEngineService.removePlayer(room.id, socket.user.id);
							} catch (error) {
								console.error(
									`Unable to remove user ${socket.user.id} from engine room ${room.id}:`,
									error
								);
							}
						}
						const { updatedRooms, removedRoomIds } = await leaveAllRooms(socket.user.id);
						for (const room of updatedRooms) {
							io.to(room.id).emit("room:update", room);
						}
						for (const roomId of removedRoomIds) {
							io.to(roomId).emit("room:removed", {
								roomId,
							});
						}
						removeConnection(socket.user.id, socket.id);
						console.log(
							`user ${socket.user.id} removed after reconnect timeout`
						);
					}
				);
			} catch (error) {
				socket.emit("room:error", {
					event: "disconnect",
					message: error.message,
				});
			}
		});
	});
};
