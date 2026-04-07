const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const  { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

const userRouter = Router();

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function normalizeEmail(value) {
    return isNonEmptyString(value) ? value.trim().toLowerCase() : "";
}

function isDuplicateKeyError(error) {
    return error && error.code === 11000;
}

userRouter.post("/signup", async function(req, res) {
    const { email, password, firstName, lastName } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
        return res.status(400).json({
            message: "email, password, firstName and lastName are required"
        });
    }

    try {
        const cleanEmail = normalizeEmail(email);
        await userModel.create({
            userId: cleanEmail,
            email: cleanEmail,
            password: password,
            firstName: firstName.trim(),
            lastName: lastName.trim()
        });

        res.json({
            message: "Signup succeeded"
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Failed to signup user"
        });
    }
})

userRouter.post("/signin",async function(req, res) {
    const { email, password } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({
            message: "email and password are required"
        });
    }

    try {
        const user = await userModel.findOne({
            email: normalizeEmail(email),
            password: password
        });

        if (!user) {
            return res.status(403).json({
                message: "Incorrect credentials"
            });
        }

        const token = jwt.sign({
            id: user._id,
        }, JWT_USER_PASSWORD);

        // Store token in cookie so browser clients can send auth automatically.
        res.cookie("userToken", token, {
            httpOnly: true,
            sameSite: "lax"
        });

        return res.json({
            token: token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to signin user"
        });
    }
})

userRouter.get("/purchases", userMiddleware, async function(req, res) {
    const userId = req.userId;

    try {
        const purchases = await purchaseModel.find({
            userId,
        });

        const purchasedCourseIds = purchases.map((purchase) => purchase.courseId);

        const coursesData = await courseModel.find({
            _id: { $in: purchasedCourseIds }
        });

        return res.json({
            purchases,
            coursesData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch purchases"
        });
    }
})

module.exports = {
    userRouter: userRouter
}