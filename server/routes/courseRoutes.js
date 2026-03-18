const express = require("express");
const router = express.Router();
const checkJwt = require("../middlewares/checkJwt");
const {
  generateCourse,
  getUserCourses,
  getCourseById,
} = require("../controllers/courseController");

// Protect all course routes with Auth0 middleware
router.use(checkJwt);

// POST /api/courses/generate-course
router.post("/generate-course", generateCourse);

// GET /api/courses
router.get("/", getUserCourses);

// GET /api/courses/:id
router.get("/:id", getCourseById);

module.exports = router;
