const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { generateLessonContent } = require("../controllers/lessonController");

// Protect all lesson routes with JWT auth middleware
router.use(authMiddleware);

// POST /api/lessons/generate-lesson/:lessonId
router.post("/generate-lesson/:lessonId", generateLessonContent);

module.exports = router;
