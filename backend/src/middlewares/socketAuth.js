const jwt = require("jsonwebtoken");

function socketAuth(socket, next)
{
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader)
        return next(new Error("Auth token missing"));

    const cookies = cookieHeader.split(';').reduce((res, item) => {
        const data = item.trim().split('=');
        return { ...res, [data[0]]: data[1] };
    }, {});

    const token = cookies.accessToken;

    if (!token)
        return next(new Error("Auth token missing"));

    try {
        const user = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Invalid auth token"));
    }
}

module.exports = socketAuth;