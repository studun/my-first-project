const { Category } = require("../models");

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ msg: "Category name is required" });
        }
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ msg: "Category not found" });

        category.name = name !== undefined ? name : category.name;
        category.description = description !== undefined ? description : category.description;
        await category.save();

        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ msg: "Category not found" });

        await category.destroy();
        res.json({ msg: "Category removed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};
