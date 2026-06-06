require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const port = Number(process.env.BACKEND_PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL || "https://localhost";

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server);

require("./socket/socketHandler")(io);



const healthRoutes = require("./routes/health");
const privateRoutes = require("./routes/private");
const usersRoutes = require("./routes/users")
const loginRoutes = require("./routes/login")

app.use("/health", healthRoutes);
app.use("/private", privateRoutes);
app.use("/users", usersRoutes);
app.use("/login", usersRoutes);


server.listen(port, "0.0.0.0", () => {
	console.log(`backend listening on ${port}`);
});
