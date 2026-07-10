require("dotenv").config();
console.log("ACCESS_SECRET_TOKEN loaded:", !!process.env.ACCESS_SECRET_TOKEN);
console.log("REFRESH_SECRET_TOKEN loaded:", !!process.env.REFRESH_SECRET_TOKEN);


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const port = Number(process.env.BACKEND_PORT || 3000);

const app = express();
app.use(express.json());

const socketAuth = require("./middlewares/socketAuth");
const server = http.createServer(app);
const io = new Server(server);
io.use(socketAuth);
require("./socket/socketHandler")(io);

//every routes locations
const friendsRouter = require('./routes/friends');
const healthRoutes = require("./routes/health");
const usersRoutes = require("./routes/users")
const loginRoutes = require("./routes/login")
const logoutRoutes = require("./routes/logout")
const signinRoutes = require("./routes/signin")
const scoresRoutes = require("./routes/scores")
const tokenRoutes = require("./routes/token");

//every routes
app.use("/health", healthRoutes);
app.use("/login", loginRoutes);
app.use("/logout", logoutRoutes);
app.use("/signin", signinRoutes);
app.use("/users", usersRoutes);
app.use("/token", tokenRoutes);
app.use('/friends', friendsRouter);
app.use('/scores', scoresRoutes);

if (process.env.NODE_ENV !== 'test') {
    server.listen(port, "0.0.0.0", () => {
        console.log(`backend listening on port ${port}`);
    });
}

module.exports = app;
