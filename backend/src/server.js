const http = require("http");
const { Server } = require("socket.io");

const port = Number(process.env.BACKEND_PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL || "https://localhost";

const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "backend"}));
        return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "backend socket skeleton ready" }));
});

const io = new Server(server, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`socket connected: ${socket.id}`);
    
    socket.on("disconnect", (reason) => {
         console.log(`socket disconnected: ${socket.id} reason=${reason}`);
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log(`backend listening on ${port}`);
});