const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  generateCourse,
  getUserCourses,
  getCourseById,
  deleteCourse,
} = require("../controllers/courseController");

// Protect all course routes with JWT auth middleware
router.use(authMiddleware);

// POST /api/courses/generate-course
router.post("/generate-course", generateCourse);

// GET /api/courses
router.get("/", getUserCourses);

// GET /api/courses/:id
router.get("/:id", getCourseById);

// DELETE /api/courses/:id
router.delete("/:id", deleteCourse);

module.exports = router;
