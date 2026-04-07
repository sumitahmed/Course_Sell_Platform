const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
// brcypt, zod, jsonwebtoken
const  { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function normalizeEmail(value) {
    return isNonEmptyString(value) ? value.trim().toLowerCase() : "";
}

function isDuplicateKeyError(error) {
    return error && error.code === 11000;
}

function toValidPrice(price) {
    const parsedPrice = Number(price);
    return Number.isNaN(parsedPrice) || parsedPrice < 0 ? null : parsedPrice;
}


adminRouter.post("/signup", async function(req, res) {
    const { email, password, firstName, lastName } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
        return res.status(400).json({
            message: "email, password, firstName and lastName are required"
        });
    }

    try {
        const cleanEmail = normalizeEmail(email);
        await adminModel.create({
            userId: cleanEmail,
            email: cleanEmail,
            password: password,
            firstName: firstName.trim(),
            lastName: lastName.trim()
        });

        return res.json({
            message: "Signup succeeded"
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).json({
                message: "Admin already exists"
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Failed to signup admin"
        });
    }
})

adminRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body || {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({
            message: "email and password are required"
        });
    }

    try {
        const admin = await adminModel.findOne({
            email: normalizeEmail(email),
            password: password
        });

        if (!admin) {
            return res.status(403).json({
                message: "Incorrect credentials"
            });
        }

        const token = jwt.sign({
            id: admin._id
        }, JWT_ADMIN_PASSWORD);

        // Store token in cookie so browser-based admin clients can stay signed in.
        res.cookie("adminToken", token, {
            httpOnly: true,
            sameSite: "lax"
        });

        return res.json({
            token: token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to signin admin"
        });
    }
})

adminRouter.post("/course", adminMiddleware, async function(req, res) {
    const adminId = req.userId;
    const { title, description, imageUrl, price } = req.body || {};
    const parsedPrice = toValidPrice(price);

    if (!isNonEmptyString(title) || !isNonEmptyString(description) || !isNonEmptyString(imageUrl) || parsedPrice === null) {
        return res.status(400).json({
            message: "title, description, imageUrl and valid price are required"
        });
    }

    try {
        const course = await courseModel.create({
            title: title.trim(),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            price: parsedPrice,
            creatorId: adminId
        });

        return res.json({
            message: "Course created",
            courseId: course._id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to create course"
        });
    }
})

adminRouter.put("/course", adminMiddleware, async function(req, res) {
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = req.body || {};
    const parsedPrice = toValidPrice(price);

    if (!isNonEmptyString(courseId) || !isNonEmptyString(title) || !isNonEmptyString(description) || !isNonEmptyString(imageUrl) || parsedPrice === null) {
        return res.status(400).json({
            message: "courseId, title, description, imageUrl and valid price are required"
        });
    }

    try {
        const result = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        }, {
            title: title.trim(),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            price: parsedPrice
        });

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        return res.json({
            message: "Course updated",
            courseId: courseId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to update course"
        });
    }
})

adminRouter.get("/course/bulk", adminMiddleware,async function(req, res) {
    const adminId = req.userId;

    try {
        const courses = await courseModel.find({
            creatorId: adminId 
        });

        return res.json({
            message: "Courses fetched",
            courses
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
})

adminRouter.delete("/course/:courseId", adminMiddleware, async function(req, res) {
    const adminId = req.userId;
    const courseId = req.params.courseId;

    try {
        const deletedCourse = await courseModel.findOneAndDelete({
            _id: courseId,
            creatorId: adminId
        });

        if (!deletedCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        return res.json({
            message: "Course deleted"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to delete course"
        });
    }
});

adminRouter.post("/course/:courseId/content", adminMiddleware, async function(req, res) {
    const adminId = req.userId;
    const courseId = req.params.courseId;
    const { content } = req.body || {};

    if (!content || typeof content !== "string") {
        return res.status(400).json({
            message: "content must be a non-empty string"
        });
    }

    try {
        // Push one content item at a time for simple, beginner-friendly usage.
        const updatedCourse = await courseModel.findOneAndUpdate({
            _id: courseId,
            creatorId: adminId
        }, {
            $push: {
                content: content
            }
        }, {
            returnDocument: "after"
        });

        if (!updatedCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        return res.json({
            message: "Course content added",
            course: updatedCourse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to add course content"
        });
    }
});

module.exports = {
    adminRouter: adminRouter
}