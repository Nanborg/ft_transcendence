require("dotenv").config();
// DEBUG: Show which auth env vars are loaded
console.log("ACCESS_SECRET_TOKEN loaded:", !!process.env.ACCESS_SECRET_TOKEN);
console.log("REFRESH_SECRET_TOKEN loaded:", !!process.env.REFRESH_SECRET_TOKEN);

console.log("OAUTH42_CLIENT_ID loaded:", !!process.env.OAUTH42_CLIENT_ID);
console.log("OAUTH42_CLIENT_SECRET loaded:", !!process.env.OAUTH42_CLIENT_SECRET);

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { gameEngineService } = require("./services/gameEngineService");

const port = Number(process.env.BACKEND_PORT || 3000);

// WHY: Express handles HTTP API, Socket.IO handles realtime
const app = express();
// REQUIRED: Nginx/Docker proxy must expose real client IP
app.set('trust proxy', 1);
app.use(express.json());
const cookieParser = require('cookie-parser');
// REQUIRED: Auth tokens are stored in cookies
app.use(cookieParser());

const socketAuth = require("./middlewares/socketAuth");
const server = http.createServer(app);
const io = new Server(server);
// REQUIRED: Socket users must be authenticated
io.use(socketAuth);
// WHY: Socket handlers are grouped outside server bootstrap
require("./socket/socketHandler")(io);

// WHY: Route modules keep API domains separated
const friendsRouter = require('./routes/friends');
const healthRoutes = require("./routes/health");
const usersRoutes = require("./routes/users")
const loginRoutes = require("./routes/login")
const logoutRoutes = require("./routes/logout")
const registerRoutes = require("./routes/register")
const scoresRoutes = require("./routes/scores")
const tokenRoutes = require("./routes/token");

// REQUIRED: Public API prefixes
app.use("/health", healthRoutes);
app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/register", registerRoutes);
app.use("/users", usersRoutes);
app.use("/token", tokenRoutes);
app.use('/friends', friendsRouter);
app.use('/scores', scoresRoutes);


function shutdown(signal)
{
	// SAFETY: Close UDP and HTTP before process exit
	console.log(`${signal} received, shutting down`);
	gameEngineService.close();
	server.close(() => { process.exit(0); });
}

if (process.env.NODE_ENV !== 'test')
{
	// REQUIRED: Tests import app without listening
	gameEngineService.start();
	gameEngineService.on("message", (message) =>
	{
		// DEBUG: Engine ping confirms UDP bridge
		if (message.type === "ping")
			console.log("Game engine ping:", message);
	});
	gameEngineService.on("invalid-message", ({ raw }) => { console.error("Invalid game engine message:", raw); });
	// SAFETY: Docker stop sends SIGTERM
	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));
	server.listen(port, "0.0.0.0", () => { console.log(`backend listening on port ${port}`); });
}

module.exports = app;
