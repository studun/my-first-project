const { Medicine, Category, Supplier, Purchase, PurchaseItem } = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

/**
 * @desc    Get all medicines
 */
exports.getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.findAll({
            order: [["name", "ASC"]]
        });
        res.status(200).json({ success: true, medicines });
    } catch (err) {
        console.error(`[Medicine GetAll Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch medicines" });
    }
};

/**
 * @desc    Create a new medicine
 */
exports.createMedicine = async (req, res) => {
    try {
        const { name, price, quantity } = req.body;
        const parsedPrice = parseFloat(price) || 0;
        const parsedQuantity = parseInt(quantity, 10) || 0;

        const medicine = await Medicine.create({
            name: name || "Unnamed Medicine",
            buying_price: parsedPrice,
            selling_price: parsedPrice,
            stock_quantity: parsedQuantity,
            expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        });

        res.status(201).json({ success: true, medicine });
    } catch (err) {
        console.error(`[Medicine Create Error]: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

/**
 * @desc    Mark medicine as expired
 */
exports.expireMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) {
            return res.status(404).json({ error: "Medicine not found" });
        }

        await medicine.update({ 
            expiry_date: new Date().toISOString().split('T')[0],
            stock_quantity: 0 
        });
        res.json({ success: true, message: "Medicine marked as expired successfully" });
    } catch (err) {
        console.error(`[Medicine Expire Error]: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

/**
 * @desc    Update medicine details
 */
exports.updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.filename;
        }

        await medicine.update(updateData);
        res.json({ success: true, medicine });
    } catch (err) {
        console.error(`[Medicine Update Error]: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Delete medicine (RESTRICTED if has sales/purchases)
 */
exports.deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: "Medicine not found" });
        }

        await medicine.destroy();
        res.json({ success: true, message: "Medicine removed successfully" });
    } catch (err) {
        console.error(`[Medicine Delete Error]: ${err.message}`);
        const message = err.name === "SequelizeForeignKeyConstraintError" 
            ? "Cannot delete medicine with existing transaction history" 
            : "Failed to delete medicine";
        res.status(400).json({ success: false, message });
    }
};

/**
 * @desc    Get medicines below stock threshold
 */
exports.getLowStock = async (req, res) => {
    try {
        const medicines = await Medicine.findAll({
            where: {
                stock_quantity: {
                    [Op.lte]: sequelize.col("low_stock_threshold")
                }
            },
            include: ["category"]
        });
        res.json({ success: true, count: medicines.length, medicines });
    } catch (err) {
        console.error(`[Medicine LowStock Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch low stock alert" });
    }
};

/**
 * @desc    Get medicines that have expired or are expiring
 */
exports.getExpired = async (req, res) => {
    try {
        const today = new Date();
        const medicines = await Medicine.findAll({
            where: {
                expiry_date: {
                    [Op.lte]: today
                }
            },
            include: ["category"]
        });
        res.json({ success: true, count: medicines.length, medicines });
    } catch (err) {
        console.error(`[Medicine Expired Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch expired medicines" });
    }
};
