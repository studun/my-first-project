const express = require("express");
const router = express.Router();
const { getAllSales, createSale } = require("../controllers/saleController");
const { auth } = require("../middleware/auth");

router.get("/", auth, getAllSales);
router.post("/", auth, createSale);

module.exports = router;
