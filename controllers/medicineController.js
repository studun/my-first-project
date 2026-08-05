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
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.createMedicine = async (req, res) => {
    const { name, generic_name, batch_number, expiry_date, buying_price, selling_price, stock_quantity, low_stock_threshold, categoryId, supplierId, side_effects } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        if (!name || !expiry_date || buying_price === undefined || selling_price === undefined) {
            return res.status(400).json({ msg: "Please provide all required fields" });
        }

        const medicine = await Medicine.create({
            name, generic_name, batch_number, expiry_date, 
            buying_price: parseFloat(buying_price), 
            selling_price: parseFloat(selling_price), 
            stock_quantity: parseInt(stock_quantity) || 0, 
            low_stock_threshold: parseInt(low_stock_threshold) || 10, 
            categoryId, supplierId, side_effects, image
        });
        res.status(201).json(medicine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
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

        medicine.name = name !== undefined ? name : medicine.name;
        medicine.generic_name = generic_name !== undefined ? generic_name : medicine.generic_name;
        medicine.batch_number = batch_number !== undefined ? batch_number : medicine.batch_number;
        medicine.expiry_date = expiry_date !== undefined ? expiry_date : medicine.expiry_date;
        medicine.buying_price = buying_price !== undefined ? parseFloat(buying_price) : medicine.buying_price;
        medicine.selling_price = selling_price !== undefined ? parseFloat(selling_price) : medicine.selling_price;
        medicine.stock_quantity = stock_quantity !== undefined ? parseInt(stock_quantity) : medicine.stock_quantity;
        medicine.low_stock_threshold = low_stock_threshold !== undefined ? parseInt(low_stock_threshold) : medicine.low_stock_threshold;
        medicine.categoryId = categoryId !== undefined ? categoryId : medicine.categoryId;
        medicine.supplierId = supplierId !== undefined ? supplierId : medicine.supplierId;
        medicine.side_effects = side_effects !== undefined ? side_effects : medicine.side_effects;

        await medicine.save();
        res.json(medicine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.deleteMedicine = async (req, res) => {
    try {
        let medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) return res.status(404).json({ msg: "Medicine not found" });

        await medicine.destroy();
        res.json({ msg: "Medicine removed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
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
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
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
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};
