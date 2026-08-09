const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Note: Password hashing is handled by the User model's 'beforeSave' hook.
        user = await User.create({
            name,
            email,
            password, // Passed raw, hook will hash it
            role: role || "sales"
        });

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ 
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        console.error(`[Auth Register Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Registration failed", error: err.message });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Use scope 'withPassword' because defaultScope excludes it
        let user = await User.scope("withPassword").findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        console.error(`[Auth Login Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Login failed" });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error(`[Auth getMe Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
