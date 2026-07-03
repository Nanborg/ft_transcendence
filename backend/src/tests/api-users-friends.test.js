const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const prisma = require('../db');

describe("Tests de l'API Users & Friends", () => {
    let testToken;
    let targetUserId;

    beforeAll(async () => {
        await prisma.user.deleteMany();

        const mainUser = await prisma.user.create({
            data: {
                username: "yaob_tester",
                email: "yaob@test.com",
                password: "hashedpassword123"
            }
        });

        const targetUser = await prisma.user.create({
            data: {
                username: "mate_tester",
                email: "mate@test.com",
                password: "hashedpassword123"
            }
        });
        targetUserId = targetUser.id;

        testToken = jwt.sign(
            { id: mainUser.id },
            process.env.ACCESS_SECRET_TOKEN || 'monsecret123',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("GET /users/search", () => {
        test("Doit renvoyer une erreur 400 si la recherche est vide", async () => {
            const response = await request(app)
                .get('/users/search?search=')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        test("Doit trouver un utilisateur avec une recherche partielle", async () => {
            const response = await request(app)
                .get('/users/search?search=mate')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0].username).toBe("mate_tester");
        });

        test("Doit renvoyer une erreur 404 si personne n'est trouvé", async () => {
            const response = await request(app)
                .get('/users/search?search=fantome')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(404);
        });
    });

    describe("GET /users/me", () => {
        test("Doit renvoyer le profil de l'utilisateur (200)", async () => {
            const response = await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.username).toBeDefined();
            expect(response.body.email).toBe("yaob@test.com");
        });
    });

    describe("PATCH /users/me", () => {
        test("Doit mettre à jour le pseudo avec succès (200)", async () => {
            const response = await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ username: "yaob_nouveau" });
            expect(response.status).toBe(200);
            expect(response.body.username).toBe("yaob_nouveau");
        });

        test("Doit renvoyer une erreur 409 si le pseudo est déjà pris", async () => {
            const response = await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ username: "mate_tester" });
            expect(response.status).toBe(409);
        });

        test("Doit renvoyer une erreur 400 si les données sont vides", async () => {
            const response = await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ username: "" });
            expect(response.status).toBe(400);
        });
    });

    describe("GET /friends", () => {
        test("Doit renvoyer la liste d'amis (200)", async () => {
            const response = await request(app)
                .get('/friends')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe("POST /friends/:id", () => {
        test("Doit ajouter un ami avec succès (200)", async () => {
            const response = await request(app)
                .post(`/friends/${targetUserId}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Ami ajouté avec succès !");
        });

        test("Doit renvoyer une erreur 404 si l'utilisateur n'existe pas", async () => {
            const response = await request(app)
                .post('/friends/999999')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(404);
        });

        test("Doit renvoyer une erreur 400 si l'ID d'ami est invalide", async () => {
            const response = await request(app)
                .post('/friends/notanumber')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(400);
        });
    });

    describe("DELETE /friends/:id", () => {
        test("Doit retirer un ami avec succès (200)", async () => {
            const response = await request(app)
                .delete(`/friends/${targetUserId}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Ami retiré avec succès !");
        });

        test("Doit renvoyer une erreur 400 si l'ID d'ami est invalide", async () => {
            const response = await request(app)
                .delete('/friends/notanumber')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(400);
        });
    });
});