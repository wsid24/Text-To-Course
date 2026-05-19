const express = require("express");
const router = express.Router();
const { getMe } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Auth0 handles login/registration via its hosted pages.
// The API only needs to verify tokens and echo the current user.
router.get("/me", authMiddleware, getMe);

module.exports = router;
