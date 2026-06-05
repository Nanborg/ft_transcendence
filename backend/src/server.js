const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
const port = process.env.BACKEND_PORT || 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

app.use(express.json());
app.get('/health', (req, res) => {
	res.json({ "status": "ok", "message": "The backend is operational!"})
})
app.post('/api/users', async (req, res) => {
    try {
        const { email, username } = req.body;
        const newUser = await prisma.user.create({
            data: {
                email: email,
                username: username,
            },
        });
        res.status(201).json({ message: "Joueur créé avec succès !", user: newUser });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Impossible de créer le joueur (Pseudo ou Email déjà pris ?)" });
    }
});
app.listen(port, () => {
    console.log(`the server has start on port ${port}`);
});