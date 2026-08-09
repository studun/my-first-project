const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { auth, checkRole } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/", auth, getAllCategories);

router.post(
    "/", 
    auth, 
    checkRole(["admin", "inventory_manager"]), 
    [
        body("name", "Category name is required (2-50 chars)").isLength({ min: 2, max: 50 }).trim(),
        validate
    ],
    createCategory
);

router.put(
    "/:id", 
    auth, 
    checkRole(["admin", "inventory_manager"]), 
    [
        body("name", "Category name is required").optional().notEmpty().trim(),
        validate
    ],
    updateCategory
);

router.delete("/:id", auth, checkRole(["admin"]), deleteCategory);

module.exports = router;
