const { Supplier } = require("../models");

exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.json(suppliers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.createSupplier = async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        if (!name || !phone) {
            return res.status(400).json({ msg: "Name and phone are required" });
        }
        const supplier = await Supplier.create({ name, contact_person, phone, email, address });
        res.status(201).json(supplier);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        let supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ msg: "Supplier not found" });

        supplier.name = name !== undefined ? name : supplier.name;
        supplier.contact_person = contact_person !== undefined ? contact_person : supplier.contact_person;
        supplier.phone = phone !== undefined ? phone : supplier.phone;
        supplier.email = email !== undefined ? email : supplier.email;
        supplier.address = address !== undefined ? address : supplier.address;
        await supplier.save();

        res.json(supplier);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        let supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ msg: "Supplier not found" });

        await supplier.destroy();
        res.json({ msg: "Supplier removed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};
