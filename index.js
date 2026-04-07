require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow Postman/server-side requests without Origin header.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const requestMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;

// Basic in-memory limiter for learning/demo projects.
app.use(function rateLimiter(req, res, next) {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const existing = requestMap.get(clientIp);

    if (!existing || now > existing.resetAt) {
        requestMap.set(clientIp, {
            count: 1,
            resetAt: now + WINDOW_MS
        });
        return next();
    }

    if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
            message: "Too many requests. Please try again after a minute."
        });
    }

    existing.count += 1;
    requestMap.set(clientIp, existing);
    next();
});


app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

app.use(function errorHandler(err, req, res, next) {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error"
    });
});

async function dropLegacyPurchaseIndex() {
    try {
        const purchasesCollection = mongoose.connection.collection("purchases");
        const indexes = await purchasesCollection.indexes();
        const legacyIndex = indexes.find((index) => index.name === "purchaseId_1" && index.unique);

        if (legacyIndex) {
            await purchasesCollection.dropIndex("purchaseId_1");
            console.log("Dropped legacy index purchaseId_1");
        }
    } catch (error) {
        // Keep boot resilient even when collection/index does not exist yet.
        console.log("No legacy purchase index cleanup needed");
    }
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await dropLegacyPurchaseIndex();

        app.listen(3000);
        console.log("listening on port 3000");
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

main()