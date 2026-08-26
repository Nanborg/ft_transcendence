const { createRoom, joinRoom, leaveRoom, leaveAllRooms, getPlayerInRoom, getRoom, setPlayerReady, startGame, markGamePlaying, setPlayerInput, getRoomsByUserId, resetGameStart } = require("./rooms");
const { addConnection, removeConnection, getConnection, scheduleDisconnect } = require("./connections");
const { gameEngineService, PLAYER_ACTION, PLAYER_UPGRADE, } = require("../services/gameEngineService");
const { adaptPayloadForDB, saveGameResults } = require("../services/gameService");

const processingGameEnds = new Set();

//Princiamf2
// TODO(princiamf2): Add Socket.IO tests for room lifecycle, gameplay events,
// invalid payloads, disconnects, and multi-room isolation.
// These tests should cover create, join, ready, start, input, state, end,
// leave, reconnect, and room deletion.
function normalizeEngineEntity(entity)
{
	const normalizedEntity = {
		...entity,
	};
	if (typeof normalizedEntity.typeId !== "number" && typeof normalizedEntity.entityTypeId === "number")
		normalizedEntity.typeId = normalizedEntity.entityTypeId;
	delete normalizedEntity.entityTypeId;
	return normalizedEntity;
}
module.exports = (io) => {
	gameEngineService.on("playerUpdate", message => {
		const roomId = message?.roomId ?? message?.room;
		if (
			!message ||
			typeof roomId !== "string" ||
			!message.playerData ||
			typeof message.playerData !== "object" ||
			Array.isArray(message.playerData)
		) {
			console.error("Invalid playerUpdate received from game engine:", message);
			return;
		}
		const normalizedPlayer = gameEngineService.cachePlayerUpdate(
			roomId,
			message.playerData,
			message.tick
		);
		if (!normalizedPlayer) {
			console.error(`Unable to map playerupdate for room ${roomId}:`, message.playerData);
			return;
		}
		const session = gameEngineService.getSession(roomId);
		io.to(roomId).emit("game:state:update", {
			roomId,
			tick:
				typeof message.tick === "number"
					? message.tick
					: session?.tick ?? 0,
			end: false,
			entityUpdate: [],
			entityDelete: [],
			playerData: [normalizedPlayer],
		});
	});
	gameEngineService.on("entityUpdate", (message) => {
		const roomId = message?.roomId ?? message?.room;
		if (
			!message ||
			typeof roomId !== "string" ||
			typeof message.entity !== "object" ||
			message.entity === null
		) {
			console.error(
				"Invalid entityUpdate received from game engine:",
				message
			);
			return;
		}
		const entity = normalizeEngineEntity(message.entity);
		gameEngineService.cacheEntityUpdate(roomId, entity, message.tick);
		io.to(roomId).emit("game:state:update", {
			roomId,
			tick: message.tick,
			end: false,
			entityUpdate: [ entity ],
			entityDelete: [],
			playerData: [],
		});
	});
	gameEngineService.on("gameEnd", async (message) => {
		const roomId = message?.roomId ?? message?.room;
		if (!message || typeof roomId !== "string" || typeof message.reason !== "string")
		{
			console.error("Invalid gameEnd received from game engine:", message);
			return;
		}
		if (processingGameEnds.has(roomId))
		{
            console.log(`[GameEnd] Duplicate event ignored for room: ${roomId}`);
            return;
        }
		processingGameEnds.add(roomId);
		const snapshot = gameEngineService.getStateSnapshot(roomId);
		const endedAt = Date.now();
		const serverStartedAt = snapshot?.serverStartedAt;
		const durationSeconds = typeof serverStartedAt === "number" ? Math.max(0, Math.floor((endedAt - serverStartedAt) / 1000)) : 0;
		const entities = Array.isArray(message.entities) ? message.entities.map(normalizeEngineEntity) : snapshot?.entities ?? [];
		const playerData = Array.isArray(message.playerData) ? message.playerData : snapshot?.playerData ?? [];
		const tick = typeof message.tick === "number" ? message.tick : snapshot?.tick ?? 0;
		const win = typeof message.win === "boolean" ? message.win : message.victory === true;
		try{
			const session = gameEngineService.getSession(roomId);
            const enginePayload = {
                roomId: roomId,
                win: win,
                reason: message.reason,
                durationSeconds: durationSeconds,
                playerData: playerData.map(p => {
                    const sessionPlayer = session?.players.find(sp => sp.enginePlayerId === p.playerId);
                    return {
                        ...p,
                        playerId: sessionPlayer ? sessionPlayer.userId : p.playerId
                    };
                })
            };
            const dbData = adaptPayloadForDB(enginePayload);
			// TEMP: Saving stats immediately here. Logic might change when real win conditions are implemented.
            await saveGameResults(dbData);
			let roomToUpdate = null;
			try {
                roomToUpdate = await resetGameStart(roomId);
            }
			catch (err) {
                if (err.code === 'P2025') {
                    console.log(`Room ${roomId} has already been deleted.`);
                }
				else {
                    throw err;
                }
            }
            io.to(roomId).emit("game:end", {
                roomId,
                tick,
                durationSeconds,
                end: true,
                win,
                reason: message.reason,
                entities,
                playerData,
            });
            if (roomToUpdate) {
                io.to(roomId).emit("room:update", roomToUpdate);
            }
		}
		catch (error) {
			console.error(`Unable to complete game end for room ${roomId};`, error);
			io.to(roomId).emit("game:error", {
				roomId,
				code: "GAME_END_PROCESSING_FAILED",
				message: "Unable to complete the game end",
			});
		}
		finally {
			processingGameEnds.delete(roomId);
            console.log(`[GameEnd] Lock released for room: ${roomId}`);
		}
		await gameEngineService.destroyGame(roomId);
	});
	gameEngineService.on("entityDelete", (message) => {
		const roomId = message?.roomId ?? message?.room;
		if (
			!message ||
			typeof roomId !== "string" ||
			typeof message.entity !== "object" ||
			message.entity === null ||
			typeof message.entity.entityId !== "number"
		) {
			console.error(
				"Invalid entityDelete received from game engine:",
				message
			);
			return;
		}
		const deletedEntity = normalizeEngineEntity(message.entity);
		gameEngineService.cacheEntityDelete(roomId, deletedEntity.entityId, message.tick);
		io.to(roomId).emit("game:state:update", {
			roomId,
			tick: message.tick,
			end: false,
			entityUpdate: [],
			entityDelete: [deletedEntity],
			playerData: [],
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

		socket.on("debug:latency:check", ({clientSentAt }) => {

			if (!clientSentAt || typeof clientSentAt !== "number")
				return ;

			socket.emit("debug:latency:result", {
				clientSentAt,
				backendReceivedAt: Date.now(),
			});
		});





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
				let { room, error } = await startGame(roomId, socket.user.id);
				if (error) {
					socket.emit("room:error", {
						event: "game:start",
						message: error,
					});
					return;
				}
				let engineSession;
				io.to(roomId).emit("room:update", room);

				try {
					engineSession = await gameEngineService.startGame(room);
				} catch (error) {
					console.error("Unable to start game engine session:", error);
					const restoredRoom = await resetGameStart(roomId);
					io.to(roomId).emit("room:update", restoredRoom);
					const errorCode =
						error?.code === "ROOM_READY_TIMEOUT"
							? "GAME_ENGINE_ROOM_READY_TIMEOUT"
							: error?.code === "ROOM_INIT_FAILED"
								? "GAME_ENGINE_INIT_FAILED"
								: "GAME_ENGINE_START_FAILED";
					socket.emit("room:error", {
						event: "game:start",
						code: errorCode,
						message: errorCode === "GAME_ENGINE_ROOM_READY_TIMEOUT"
							? "Game engine did not confirm room readiness in time"
							: errorCode === "GAME_ENGINE_INIT_FAILED"
								? "Game engine failed while loading the map"
								: "Unable to start the game engine",
					});
					return;
				}
				room = await markGamePlaying(roomId);

				io.to(roomId).emit("room:update", room);
				io.to(roomId).emit("game:start", {
					roomId: room.id,
					status: room.status,
					players: room.players,
					enginePlayers: engineSession.players,
					timestamp: Date.now(),
				});
				const initialState = gameEngineService.getStateSnapshot(roomId);
				if (initialState)
					io.to(roomId).emit("game:state:init", initialState);
				console.log(`game starting in room ${room.id}`);
			} catch (error) {
				socket.emit("room:error", {
					event: "game:start",
					message: error.message,
				});
			}
		});

		socket.on("game:resync", async (payload) => {
			if (!payload || typeof payload.roomId !== "string")
			{
				socket.emit("game:error", {
					roomId: payload?.roomId ?? "",
					code: "INVALID_PAYLOAD",
					message: "Invalid game resync payload",
				});
				return;
			}
			const { roomId } = payload;
			try {
				const player = await getPlayerInRoom(roomId, socket.user.id);
				if (!player) {
					socket.emit("game:error", {
						roomId,
						code: "PLAYER_NOT_IN_ROOM",
						message: "Player is not in room",
					});
					return;
				}
				const snapshot = gameEngineService.getStateSnapshot(roomId);
				if (!snapshot) {
					socket.emit("game:error", {
						roomId,
						code: "GAME_NOT_RUNNING",
						message: "Game is not running",
					});
					return;
				}
				const room = await getRoom(roomId);
				const engineSession = gameEngineService.getSession(room.id);
				const connection = getConnection(socket.user.id);
				if (connection?.reconnectTimer && connection.keepOnReconnect) {
					clearTimeout(connection.reconnectTimer);
					connection.reconnectTimer = null;
					connection.keepOnReconnect = false;
					connection.disconnectedAt = null;
				}
				socket.emit("game:start", {
					roomId: room.id,
					status: room.status,
					players: room.players,
					enginePlayers: engineSession.players,
					timestamp: Date.now(),
				});
				socket.emit("game:state:init", snapshot);
			} catch (error) {
				console.error(`Unable to resync game state for room ${roomId}:`, error);
				socket.emit("game:error", {
					roomId,
					code: "GAME_RESYNC_FAILED",
					message: "Unable to resync game state",
				});
			}
		});

		socket.on("player:input", async (payload) => {
			if (
				!payload ||
				typeof payload.roomId !== "string" ||
				typeof payload.input !== "object" ||
				payload.input === null ||
				Array.isArray(payload.input)
			) {
				socket.emit("room:error", {
					event: "player:input",
					message: "Invalid payload",
				});
				return;
			}
			try {
				const { roomId, input } = payload;
				const movementKeys = ["up", "down", "left", "right"];
				const validKeys = [...movementKeys, "action", "dirX", "dirY"];
				const inputKeys = Object.keys(input);
				const hasMovement = movementKeys.some((key) => Object.hasOwn(input, key));
				const hasAction = Object.hasOwn(input, "action");
				const hasDirection = Object.hasOwn(input, "dirX") || Object.hasOwn(input, "dirY");
				const hasInvalidKey = inputKeys.some((key) => !validKeys.includes(key));
				const hasInvalidMovement = hasMovement && movementKeys.some((key) => typeof input[key] !== "boolean");
				const normalizedAction =
					typeof input.action === "boolean"
						? input.action
							? PLAYER_ACTION.MELEE
							: PLAYER_ACTION.NONE
						: input.action;
				const requiresDirection =
					hasAction &&
					(
						normalizedAction === PLAYER_ACTION.MELEE ||
						normalizedAction === PLAYER_ACTION.RANGED
					);
				const hasInvalidDirection =
                    hasDirection &&
                    (
                        !Number.isInteger(input.dirX) ||
						!Number.isInteger(input.dirY) ||
						input.dirX < -1 ||
						input.dirX > 1 ||
						input.dirY < -1 ||
						input.dirY > 1 ||
						(input.dirX === 0 && input.dirY === 0)
                    );
				const hasMissingDirection = requiresDirection && !hasDirection;
				const hasInvalidAction = hasAction && !Object.values(PLAYER_ACTION).includes(normalizedAction);
				if (
					inputKeys.length === 0 ||
					(!hasMovement && !hasAction) ||
					hasInvalidKey ||
					hasInvalidMovement ||
					hasInvalidDirection ||
					hasMissingDirection ||
					hasInvalidAction
				) {
					socket.emit("room:error", {
						event: "player:input",
						message: "Invalid input",
					});
					return;
				}
				const normalizedInput = {
					...(hasMovement && {
						up: input.up,
						down: input.down,
						left: input.left,
						right: input.right,
					}),
					...(hasAction && {
						action: normalizedAction,
					}),
					...(hasDirection && {
                        dirX: input.dirX,
                        dirY: input.dirY,
                    }),
				};
				const { error } = await setPlayerInput(roomId, socket.user.id, normalizedInput);
				if (error) {
					socket.emit("room:error", {
						event: "player:input",
						message: error,
					});
					return;
				}
				try {
					if (hasMovement) {
						await gameEngineService.sendPlayerInput(
							roomId,
							socket.user.id,
							normalizedInput
						);
					}
					if (hasAction) {
						await gameEngineService.sendPlayerAction(
							roomId,
							socket.user.id,
							normalizedAction,
                            {
                                dirX: normalizedInput.dirX,
                                dirY: normalizedInput.dirY,
                            }
						);
					}
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
					input: normalizedInput,
					timestamp: Date.now(),
				});
			} catch (error) {
				socket.emit("room:error", {
					event: "player:input",
					message: error.message,
				});
			}
		});

		socket.on("checkpoint:upgrade", async payload => {
			if (
				!payload ||
				typeof payload.roomId !== "string" ||
				!Object.values(PLAYER_UPGRADE).includes(payload.upgrade)
			) {
				socket.emit("checkpoint:error", {
					roomId: payload?.roomId ?? "",
					code: "INVALID_PAYLOAD",
					message: "Invalid checkpoint upgrade payload",
				});
				return;
			}
			const { roomId, upgrade } = payload;
			try {
				const player = await getPlayerInRoom(roomId, socket.user.id);
				if (!player) {
					socket.emit("checkpoint:error", {
						roomId,
						code: "PLAYER_NOT_IN_ROOM",
						message: "Player is not in room",
					});
					return;
				}
				const playerData = gameEngineService.getPlayerData(roomId, socket.user.id);
				if (!playerData) {
					socket.emit("checkpoint:error", {
						roomId,
						code: "PLAYER_DATA_UNAVAILABLE",
						message: "Player data is unavailable",
					});
					return;
				}
				if (playerData.atACheckpoint !== true) {
					socket.emit("checkpoint:error", {
						roomId,
						code: "PLAYER_NOT_AT_CHECKPOINT",
						message: "Player is not at a checkpoint",
					});
					return;
				}
				await gameEngineService.sendCheckpointUpgrade(
					roomId,
					socket.user.id,
					playerData,
					upgrade
				);
			} catch (error) {
				console.error(`Unable to upgrade ${upgrade} for user ${socket.user.id}:`, error);
				socket.emit("checkpoint:error", {
					roomId,
					code: "CHECKPOINT_UPGRADE_FAILED",
					message: "Unable to upgrade ability",
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
				const roomBeforeLeave = await getRoom(roomId);
				const isLastPlayer =
					roomBeforeLeave &&
					roomBeforeLeave.players.length === 1 &&
					String(roomBeforeLeave.players[0].id) ===
						String(socket.user.id);
				try {
					if (isLastPlayer) {
						await gameEngineService.stopGame(roomId, "all_players_left");
					} else {
						await gameEngineService.removePlayer(roomId, socket.user.id);
					}
				} catch (error) {
					console.error(`Unable to remove user ${socket.user.id} from engine room ${roomId}:`, error);
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

		socket.on("disconnect", async () => {
			try {
				const stopInput = {
    				up: false,
    				down: false,
    				left: false,
    				right: false
				};
				const userRooms = await getRoomsByUserId(socket.user.id);
				const keepOnReconnect = userRooms.some((room) => gameEngineService.getSession(room.id));
				for (const room of userRooms) {
                	await gameEngineService.sendPlayerInput(room.id, socket.user.id, stopInput);
                }
				scheduleDisconnect(
					socket.user.id,
					socket.id,
					async () => {
						const userRooms = await getRoomsByUserId(socket.user.id);
						for (const room of userRooms) {
							try {
								const engineSession = gameEngineService.getSession(room.id);
								if (!engineSession || room.players.length <= 1) {
									await gameEngineService.stopGame(room.id, "all_players_left");
								}
								else {
									await gameEngineService.removePlayer(room.id, socket.user.id);
								}
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
					},
					keepOnReconnect
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
