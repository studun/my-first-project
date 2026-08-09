const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getAllSales, createSale } = require("../controllers/saleController");
const { auth, checkRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/", auth, getAllSales);

router.post(
    "/", 
    auth, 
    checkRole(["admin", "pharmacist", "sales"]), 
    [
        body("items", "Items must be an array").isArray({ min: 1 }),
        body("items.*.medicineId", "Each item needs a medicineId").isInt(),
        body("items.*.quantity", "Quantity must be at least 1").isInt({ min: 1 }),
        validate
    ],
    createSale
);

module.exports = router;
