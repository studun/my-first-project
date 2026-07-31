const { Supplier } = require("../models");

exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.createSupplier = async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        const supplier = await Supplier.create({ name, contact_person, phone, email, address });
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.updateSupplier = async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        let supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ msg: "Supplier not found" });

        supplier.name = name || supplier.name;
        supplier.contact_person = contact_person || supplier.contact_person;
        supplier.phone = phone || supplier.phone;
        supplier.email = email || supplier.email;
        supplier.address = address || supplier.address;
        await supplier.save();

        res.json(supplier);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        let supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ msg: "Supplier not found" });

        await supplier.destroy();
        res.json({ msg: "Supplier removed" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
