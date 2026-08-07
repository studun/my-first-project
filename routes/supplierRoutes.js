const express = require("express");
const router = express.Router();
const { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } = require("../controllers/supplierController");
const { auth, checkRole } = require("../middleware/auth");

router.get("/", auth, getAllSuppliers);
router.post("/", auth, checkRole(["admin", "inventory_manager"]), createSupplier);
router.put("/:id", auth, checkRole(["admin", "inventory_manager"]), updateSupplier);
router.delete("/:id", auth, checkRole(["admin"]), deleteSupplier);

module.exports = router;
