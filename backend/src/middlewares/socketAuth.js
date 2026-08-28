const jwt = require("jsonwebtoken");

function socketAuth(socket, next)
{
    const token = socket.handshake.auth?.token;

    if (!token)
    {
        const error = new Error("Auth token missing"); //test-nico
        error.data = { code: "TOKEN_MISSING" };
        return next(error);
    }

    try
    {
        const user = jwt.verify(
            token,
            process.env.ACCESS_SECRET_TOKEN
        );
        socket.user = user;
        next();
    } catch (error)
    {
        const authError = new Error( //test-nico
            error.name === "TokenExpiredError"
                ? "Auth token expired"
                : "Invalid auth token"
        );
        authError.data = {
            code: error.name === "TokenExpiredError"
                ? "TOKEN_EXPIRED"
                : "TOKEN_INVALID"
        };
        next(authError);
    }
}

module.exports = socketAuth;
