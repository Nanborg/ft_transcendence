const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { generateAccessToken } = require("../middlewares/OAuth");
const prisma = require("../db");

const router = express.Router();
router.use(express.json());

class AuthRefreshError extends Error {
	constructor(status, code, message) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

function verifyRefreshToken(refreshToken) {
	try {
		return jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN);
	} catch (error) {
		const code = error.name === "TokenExpiredError"
			? "REFRESH_TOKEN_EXPIRED"
			: "REFRESH_TOKEN_INVALID";
		throw new AuthRefreshError(401, code, "Invalid refresh token");
	}
}

function setAuthCookies(res, accessToken, refreshToken) {
	res.cookie('accessToken', accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 20 * 60 * 1000,
	});
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
}

router.post("/", async (req, res) => {
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		return res.status(401).json({
			error: "Missing refresh token",
			code: "REFRESH_TOKEN_MISSING"
		});
	}

	try {
		const decoded = verifyRefreshToken(refreshToken);

		const tokens = await prisma.$transaction(async (tx) => {
			const tokenRecord = await tx.refreshToken.findUnique({
				where: { token: refreshToken }
			});

			if (!tokenRecord || tokenRecord.userId !== decoded.id) {
				throw new AuthRefreshError(401, "REFRESH_TOKEN_INVALID", "Invalid refresh token");
			}
			if (tokenRecord.expiresAt < new Date()) {
				throw new AuthRefreshError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token expired");
			}
			if (tokenRecord.isRevoked) {
				throw new AuthRefreshError(401, "REFRESH_TOKEN_REVOKED", "Refresh token revoked");
			}

			const revoked = await tx.refreshToken.updateMany({
				where: {
					id: tokenRecord.id,
					isRevoked: false
				},
				data: { isRevoked: true }
			});

			if (revoked.count !== 1) {
				throw new AuthRefreshError(401, "REFRESH_TOKEN_REVOKED", "Refresh token revoked");
			}

			const userPayload = {
				id: decoded.id,
				username: decoded.username
			};
			const accessToken = generateAccessToken(userPayload);
			const nextRefreshToken = jwt.sign(
				userPayload,
				process.env.REFRESH_SECRET_TOKEN,
				{
					expiresIn: "7d",
					algorithm: "HS256",
					jwtid: crypto.randomUUID()
				}
			);
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);

			await tx.refreshToken.create({
				data: {
					token: nextRefreshToken,
					userId: userPayload.id,
					expiresAt
				}
			});

			return {
				accessToken,
				refreshToken: nextRefreshToken
			};
		});

		setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
		return res.json({ message: "Access granted" });
	} catch (error) {
		if (error instanceof AuthRefreshError) {
			return res.status(error.status).json({
				error: error.message,
				code: error.code
			});
		}
		console.error("Refresh token error:", error);
		return res.status(500).json({
			error: "Server error",
			code: "TOKEN_REFRESH_INTERNAL_ERROR"
		});
	}
});

module.exports = router;
