const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const sequelize = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === "development";

// --- Security Middleware ---
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable if it interferes with frontend assets, or configure strictly
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));

// Rate Limiting: Prevent brute force on auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api/auth", authLimiter);

// --- Standard Middleware ---
app.use(express.json({ limit: "1mb" })); // Limit body size to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/sales", require("./routes/saleRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// --- Frontend Serving ---
// Handle SPA routing: Serve index.html for any non-API routes
app.get(/(.*)/, (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(`[Global Error]: ${err.stack}`);
    
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: isDevelopment ? err.message : "An internal server error occurred",
        ...(isDevelopment && { stack: err.stack })
    });
});

// --- Database & Server Startup ---
const startServer = async () => {
    try {
        // Authenticate database connection
        await sequelize.authenticate();
        console.log("✔ Database connection established successfully.");

        // Sync models (Safe sync: avoids dropping data in production)
        const syncOptions = isDevelopment ? { alter: true } : { force: false };
        await sequelize.sync(syncOptions);
        console.log(`✔ Database tables synchronized (${isDevelopment ? "Alter mode" : "Standard mode"}).`);

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error("✘ Unable to start server:", error);
        process.exit(1);
    }
};

startServer();
