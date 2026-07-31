const express = require("express");
const path = require("path");
const sequelize = require("./config/database");
const { User } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/sales", require("./routes/saleRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Serve Frontend
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

sequelize.sync()
    .then(() => {
        console.log("Database tables synchronized successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database synchronization error:", error);
    });