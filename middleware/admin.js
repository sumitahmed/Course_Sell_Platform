const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

// function middleware(password) {
//     return function(req, res, next) {
//         const token = req.headers.token;
//         const decoded = jwt.verify(token, password);

//         if (decoded) {
//             req.userId = decoded.id;
//             next()
//         } else {
//             res.status(403).json({
//                 message: "You are not signed in"
//             })
//         }    
//     }
// }

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

function adminMiddleware(req, res, next) {
    const bearerToken = req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    const token = getCookieValue(req.headers.cookie, "adminToken") || bearerToken || req.headers.token;

    if (!token) {
        return res.status(403).json({
            message: "You are not signed in"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);

        req.userId = decoded.id;
        next();
    } catch (e) {
        res.status(403).json({
            message: "You are not signed in"
        });
    }
}

module.exports = {
    adminMiddleware: adminMiddleware
}