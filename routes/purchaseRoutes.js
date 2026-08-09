const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getAllPurchases, createPurchase } = require("../controllers/purchaseController");
const { auth, checkRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/", auth, getAllPurchases);

router.post(
    "/", 
    auth, 
    checkRole(["admin", "pharmacist", "inventory_manager"]), 
    [
        body("supplierId", "Supplier ID is required").isInt(),
        body("invoice_number", "Invoice number is required").notEmpty().trim(),
        body("items", "Items must be an array").isArray({ min: 1 }),
        body("items.*.medicineId", "Each item needs a medicineId").isInt(),
        body("items.*.quantity", "Quantity must be at least 1").isInt({ min: 1 }),
        body("items.*.unit_price", "Unit price must be at least 0").isFloat({ min: 0 }),
        validate
    ],
    createPurchase
);

module.exports = router;
