require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const port = Number(process.env.BACKEND_PORT || 3000);

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const server = http.createServer(app);
const io = new Server(server);
require("./socket/socketHandler")(io);

const healthRoutes = require("./routes/health");
const privateRoutes = require("./routes/private");
const usersRoutes = require("./routes/users");

app.use("/health", healthRoutes);
app.use("/private", privateRoutes);
app.use("/users", usersRoutes);

app.post('/api/users', async (req, res) => {
    try {
        const { email, username } = req.body;
        const newUser = await prisma.user.create({
            data: { email: email, username: username },
        });
        res.status(201).json({ message: "Joueur créé avec succès !", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Impossible de créer le joueur" });
    }
});

server.listen(port, "0.0.0.0", () => {
    console.log(`backend listening on port ${port}`);
});
