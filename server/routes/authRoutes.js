const express = require("express");
const router = express.Router();
const { register, login, getMe, registerRules, loginRules } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
