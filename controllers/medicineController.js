const { Medicine, Category, Supplier, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.findAll({
            include: [
                { model: Category, as: "category" },
                { model: Supplier, as: "supplier" }
            ]
        });
        res.json(medicines);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.createMedicine = async (req, res) => {
    const { name, generic_name, batch_number, expiry_date, buying_price, selling_price, stock_quantity, low_stock_threshold, categoryId, supplierId, side_effects } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const medicine = await Medicine.create({
            name, generic_name, batch_number, expiry_date, buying_price, selling_price, stock_quantity, low_stock_threshold, categoryId, supplierId, side_effects, image
        });
        res.json(medicine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.updateMedicine = async (req, res) => {
    const { name, generic_name, batch_number, expiry_date, buying_price, selling_price, stock_quantity, low_stock_threshold, categoryId, supplierId, side_effects } = req.body;
    try {
        let medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) return res.status(404).json({ msg: "Medicine not found" });

        if (req.file) {
            medicine.image = req.file.filename;
        }

        medicine.name = name || medicine.name;
        medicine.generic_name = generic_name || medicine.generic_name;
        medicine.batch_number = batch_number || medicine.batch_number;
        medicine.expiry_date = expiry_date || medicine.expiry_date;
        medicine.buying_price = buying_price || medicine.buying_price;
        medicine.selling_price = selling_price || medicine.selling_price;
        medicine.stock_quantity = stock_quantity || medicine.stock_quantity;
        medicine.low_stock_threshold = low_stock_threshold || medicine.low_stock_threshold;
        medicine.categoryId = categoryId || medicine.categoryId;
        medicine.supplierId = supplierId || medicine.supplierId;
        medicine.side_effects = side_effects || medicine.side_effects;

        await medicine.save();
        res.json(medicine);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.deleteMedicine = async (req, res) => {
    try {
        let medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) return res.status(404).json({ msg: "Medicine not found" });

        await medicine.destroy();
        res.json({ msg: "Medicine removed" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const medicines = await Medicine.findAll({
            where: {
                stock_quantity: {
                    [Op.lte]: sequelize.col("low_stock_threshold")
                }
            }
        });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.getExpired = async (req, res) => {
    try {
        const today = new Date();
        const medicines = await Medicine.findAll({
            where: {
                expiry_date: {
                    [Op.lte]: today
                }
            }
        });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
