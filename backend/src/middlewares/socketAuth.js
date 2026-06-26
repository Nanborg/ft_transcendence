const jwt = require("jsonwebtoken");

function socketAuth(socket, next)
{
    const token = socket.handshake.auth?.token;

    if (!token)
        return next(new Error("Auth token missing"));

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
        next(new Error("Invalid auth token"));
    }
}

module.exports = socketAuth;