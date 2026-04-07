const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");

function getCookieValue(cookieHeader, key) {
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const [rawKey, ...valueParts] = cookie.trim().split("=");
        if (rawKey === key) {
            return valueParts.join("=");
        }
    }

    return null;
}

function userMiddleware(req, res, next) {
    const bearerToken = req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    // Prefer cookie auth, but keep header token support for backward compatibility.
    const token = getCookieValue(req.headers.cookie, "userToken") || bearerToken || req.headers.token;

    if (!token) {
        return res.status(403).json({
            message: "You are not signed in"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD);

        req.userId = decoded.id;
        next();
    } catch (e) {
        res.status(403).json({
            message: "You are not signed in"
        });
    }
}

module.exports = {
    userMiddleware: userMiddleware
}