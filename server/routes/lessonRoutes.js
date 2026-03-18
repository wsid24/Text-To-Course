const express = require("express");
const router = express.Router();
const checkJwt = require("../middlewares/checkJwt");
const { generateLessonContent } = require("../controllers/lessonController");

// Protect all lesson routes with Auth0 middleware
router.use(checkJwt);

// POST /api/lessons/generate-lesson/:lessonId
router.post("/generate-lesson/:lessonId", generateLessonContent);

module.exports = router;
