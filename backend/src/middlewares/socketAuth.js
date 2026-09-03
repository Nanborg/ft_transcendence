const jwt = require("jsonwebtoken");

function socketAuth(socket, next)
{
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader)
    {
        const authError = new Error("Auth token missing");
        authError.data = { code: "ACCESS_TOKEN_MISSING" };
        return next(authError);
    }

    const cookies = cookieHeader.split(';').reduce((res, item) => {
        const data = item.trim().split('=');
        return { ...res, [data[0]]: data[1] };
    }, {});

    const token = cookies.accessToken;

    if (!token)
    {
        const authError = new Error("Auth token missing");
        authError.data = { code: "ACCESS_TOKEN_MISSING" };
        return next(authError);
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
        socket.user = user;
        next();
    }
    catch (error) {
        const authError = new Error(
            error.name === "TokenExpiredError" ? "Token expired" : "Invalid auth token"
        );
        authError.data = {
            code: error.name === "TokenExpiredError" ? "ACCESS_TOKEN_EXPIRED" : "ACCESS_TOKEN_INVALID"
        };
        next(authError);
    }
}

module.exports = socketAuth;
