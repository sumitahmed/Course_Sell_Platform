const { Router } = require("express");
const mongoose = require("mongoose");
const { userMiddleware } = require("../middleware/user");
const { purchaseModel, courseModel } = require("../db")
const courseRouter = Router();

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isDuplicateKeyError(error) {
    return error && error.code === 11000;
}

courseRouter.post("/purchase", userMiddleware, async function(req, res) {
    const userId = req.userId;
    const { courseId } = req.body || {};

    if (!isNonEmptyString(courseId)) {
        return res.status(400).json({
            message: "courseId is required"
        });
    }

    try {
        const course = await courseModel.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const existingPurchase = await purchaseModel.findOne({
            userId,
            courseId
        });

        if (existingPurchase) {
            return res.status(409).json({
                message: "Course already purchased"
            });
        }

        // should check that the user has actually paid the price
        await purchaseModel.create({
            purchaseId: new mongoose.Types.ObjectId().toString(),
            userId,
            courseId
        });

        return res.json({
            message: "You have successfully bought the course"
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(409).json({
                message: "Course already purchased"
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Failed to purchase course"
        });
    }
})

//no authentication required to preview the courses, as anyone can preview the courses.
courseRouter.get("/preview", async function(req, res) {
    try {
        const courses = await courseModel.find({});

        return res.json({
            courses
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
})

module.exports = {
    courseRouter: courseRouter
}