const express = require("express");
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { auth, checkRole } = require("../middleware/auth");

router.get("/", auth, getAllCategories);
router.post("/", auth, checkRole(["admin", "inventory_manager"]), createCategory);
router.put("/:id", auth, checkRole(["admin", "inventory_manager"]), updateCategory);
router.delete("/:id", auth, checkRole(["admin"]), deleteCategory);

module.exports = router;
