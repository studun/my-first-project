const { Category } = require("../models");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const category = await Category.create({ name, description });
        res.json(category);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.updateCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ msg: "Category not found" });

        category.name = name || category.name;
        category.description = description || category.description;
        await category.save();

        res.json(category);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ msg: "Category not found" });

        await category.destroy();
        res.json({ msg: "Category removed" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
