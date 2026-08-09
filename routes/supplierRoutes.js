const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } = require("../controllers/supplierController");
const { auth, checkRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/", auth, getAllSuppliers);

router.post(
    "/", 
    auth, 
    checkRole(["admin", "inventory_manager"]), 
    [
        body("name", "Supplier name is required").notEmpty().trim(),
        body("phone", "Phone number is required").notEmpty().trim(),
        body("email", "Valid email is required").optional().isEmail(),
        validate
    ],
    createSupplier
);

router.put(
    "/:id", 
    auth, 
    checkRole(["admin", "inventory_manager"]), 
    [
        body("name").optional().notEmpty().trim(),
        body("phone").optional().notEmpty().trim(),
        body("email").optional().isEmail(),
        validate
    ],
    updateSupplier
);

router.delete("/:id", auth, checkRole(["admin"]), deleteSupplier);

module.exports = router;
