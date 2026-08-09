const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");

// @route   POST /api/auth/register
router.post(
    "/register",
    [
        body("name", "Name is required (2-50 chars)").isLength({ min: 2, max: 50 }),
        body("email", "Please include a valid email").isEmail().normalizeEmail(),
        body("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
        body("role", "Invalid role").optional().isIn(["admin", "pharmacist", "inventory_manager", "sales"]),
        validate
    ],
    register
);

// @route   POST /api/auth/login
router.post(
    "/login",
    [
        body("email", "Please include a valid email").isEmail().normalizeEmail(),
        body("password", "Password is required").exists(),
        validate
    ],
    login
);

// @route   GET /api/auth/me
router.get("/me", auth, getMe);

module.exports = router;
