const express = require("express"); //test-nico
const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../db", () => ({
	$transaction: jest.fn(),
	$disconnect: jest.fn()
}));

const prisma = require("../db");
const tokenRouter = require("../routes/token");

function createApp() {
	const app = express();
	app.use(express.json());
	app.use("/token", tokenRouter);
	return app;
}

function signRefreshToken(payload = { id: 1, username: "tester" }) {
	return jwt.sign(payload, process.env.REFRESH_SECRET_TOKEN, {
		expiresIn: "7d",
		algorithm: "HS256",
		jwtid: "test-refresh-token"
	});
}

describe("POST /token", () => {
	const app = createApp();
	let consoleError;

	beforeEach(() => {
		jest.clearAllMocks();
		consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleError.mockRestore();
	});

	test("returns 401 with a stable code when refresh token is missing", async () => {
		const response = await request(app).post("/token").send({});

		expect(response.status).toBe(401);
		expect(response.body.code).toBe("REFRESH_TOKEN_MISSING");
	});

	test("rotates a refresh token inside one transaction", async () => {
		const refreshToken = signRefreshToken();
		const tx = {
			refreshToken: {
				findUnique: jest.fn().mockResolvedValue({
					id: 10,
					token: refreshToken,
					userId: 1,
					expiresAt: new Date(Date.now() + 60_000),
					isRevoked: false
				}),
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
				create: jest.fn().mockResolvedValue({})
			}
		};
		prisma.$transaction.mockImplementation((callback) => callback(tx));

		const response = await request(app)
			.post("/token")
			.send({ token: refreshToken });

		expect(response.status).toBe(200);
		expect(typeof response.body.accessToken).toBe("string");
		expect(typeof response.body.refreshToken).toBe("string");
		expect(tx.refreshToken.updateMany).toHaveBeenCalledWith({
			where: { id: 10, isRevoked: false },
			data: { isRevoked: true }
		});
		expect(tx.refreshToken.create).toHaveBeenCalledTimes(1);
	});

	test("only one concurrent backend rotation succeeds for the same token", async () => {
		const refreshToken = signRefreshToken();
		const tx = {
			refreshToken: {
				findUnique: jest.fn().mockResolvedValue({
					id: 10,
					token: refreshToken,
					userId: 1,
					expiresAt: new Date(Date.now() + 60_000),
					isRevoked: false
				}),
				updateMany: jest.fn()
					.mockResolvedValueOnce({ count: 1 })
					.mockResolvedValueOnce({ count: 0 }),
				create: jest.fn().mockResolvedValue({})
			}
		};
		prisma.$transaction.mockImplementation((callback) => callback(tx));

		const responses = await Promise.all([
			request(app).post("/token").send({ token: refreshToken }),
			request(app).post("/token").send({ token: refreshToken })
		]);
		const statuses = responses.map((response) => response.status).sort();

		expect(statuses).toEqual([200, 401]);
		expect(tx.refreshToken.create).toHaveBeenCalledTimes(1);
	});

	test("returns 500 when new token creation fails so the transaction can rollback", async () => {
		const refreshToken = signRefreshToken();
		const tx = {
			refreshToken: {
				findUnique: jest.fn().mockResolvedValue({
					id: 10,
					token: refreshToken,
					userId: 1,
					expiresAt: new Date(Date.now() + 60_000),
					isRevoked: false
				}),
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
				create: jest.fn().mockRejectedValue(new Error("db failure"))
			}
		};
		prisma.$transaction.mockImplementation((callback) => callback(tx));

		const response = await request(app)
			.post("/token")
			.send({ token: refreshToken });

		expect(response.status).toBe(500);
		expect(response.body.code).toBe("TOKEN_REFRESH_INTERNAL_ERROR");
	});
});
