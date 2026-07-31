const express = require("express");
const router = express.Router();
const { getAllPurchases, createPurchase } = require("../controllers/purchaseController");
const { auth, checkRole } = require("../middleware/auth");

router.get("/", auth, getAllPurchases);
router.post("/", auth, checkRole(["admin", "pharmacist"]), createPurchase);

module.exports = router;
