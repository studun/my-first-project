const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { body } = require("express-validator");
const { getAllMedicines, createMedicine, updateMedicine, deleteMedicine, getLowStock, getExpired, expireMedicine } = require("../controllers/medicineController");
const { auth, checkRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

// --- Multer Configuration (Hardened) ---
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: function (req, file, cb) {
        cb(null, `medicine-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
        }
    }
});

// --- Validation Schemas ---
const medicineValidation = [
    body("name", "Medicine name is required").notEmpty().trim(),
    body("expiry_date", "Valid expiry date is required").optional().isDate(),
    body("buying_price", "Buying price must be a positive number").optional().isFloat({ min: 0 }),
    body("selling_price", "Selling price must be a positive number").optional().isFloat({ min: 0 }),
    body("stock_quantity", "Stock quantity must be an integer (min 0)").optional().isInt({ min: 0 }),
    body("categoryId", "Category ID is optional").optional().isInt(),
    body("supplierId", "Supplier ID is optional").optional().isInt(),
    validate
];

// --- Routes ---
router.get("/", auth, getAllMedicines);
router.get("/low-stock", auth, getLowStock);
router.get("/expired", auth, getExpired);
router.patch("/:id/expire", auth, checkRole(["admin", "pharmacist", "inventory_manager"]), expireMedicine);

router.post(
    "/", 
    auth, 
    checkRole(["admin", "pharmacist", "inventory_manager"]), 
    upload.single("image"), 
    medicineValidation,
    createMedicine
);

router.put(
    "/:id", 
    auth, 
    checkRole(["admin", "pharmacist", "inventory_manager"]), 
    upload.single("image"), 
    [
        body("name").optional().notEmpty().trim(),
        body("expiry_date").optional().isDate(),
        body("buying_price").optional().isFloat({ min: 0 }),
        body("selling_price").optional().isFloat({ min: 0 }),
        body("stock_quantity").optional().isInt({ min: 0 }),
        validate
    ],
    updateMedicine
);

router.delete("/:id", auth, checkRole(["admin"]), deleteMedicine);

module.exports = router;
