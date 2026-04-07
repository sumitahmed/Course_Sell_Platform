const jwt = require("jsonwebtoken");
const JWT_SECRET = "s3cret";

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    if (!token) {
        return res.status(403).json({
            message: "Incorrect creds"
        });
    }

    try {
        const response = jwt.verify(token, JWT_SECRET);

        if (response) {
            req.userId = response.id;
            next();
        } else {
            res.status(403).json({
                message: "Incorrect creds"
            });
        }
    } catch (e) {
        res.status(403).json({
            message: "Incorrect creds"
        });
    }
}

module.exports = {
    auth,
    JWT_SECRET
};