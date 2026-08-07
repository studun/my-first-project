const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getAllMedicines, createMedicine, updateMedicine, deleteMedicine, getLowStock, getExpired } = require("../controllers/medicineController");
const { auth, checkRole } = require("../middleware/auth");

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/", auth, getAllMedicines);
router.get("/low-stock", auth, getLowStock);
router.get("/expired", auth, getExpired);
router.post("/", auth, checkRole(["admin", "pharmacist", "inventory_manager"]), upload.single("image"), createMedicine);
router.put("/:id", auth, checkRole(["admin", "pharmacist", "inventory_manager"]), upload.single("image"), updateMedicine);
router.delete("/:id", auth, checkRole(["admin"]), deleteMedicine);

module.exports = router;
