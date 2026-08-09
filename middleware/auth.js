const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Authentication Middleware
 * Verifies the JWT token from the Authorization header.
 * Supports standard 'Bearer <token>' format.
 */
const auth = (req, res, next) => {
    // Get token from header (Standard 'Authorization: Bearer <token>' or custom 'x-auth-token')
    let token = req.header("Authorization") || req.header("x-auth-token");

    // Clean standard Bearer prefix if present
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trimStart();
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "No token, authorization denied" 
        });
    }

    // Security: Ensure JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
        console.error("[CRITICAL] JWT_SECRET is not defined in environment variables.");
        return res.status(500).json({ 
            success: false, 
            message: "Internal server security configuration error" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure the decoded payload has the expected user object
        if (!decoded.user || !decoded.user.id) {
            throw new Error("Invalid token payload");
        }

        req.user = decoded.user;
        next();
    } catch (err) {
        const message = err.name === "TokenExpiredError" ? "Token has expired" : "Token is not valid";
        res.status(401).json({ 
            success: false, 
            message: message 
        });
    }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {Array} roles - Allowed roles for this route
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required" 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied: ${req.user.role} role does not have permission` 
            });
        }
        next();
    };
};

module.exports = { auth, checkRole };
