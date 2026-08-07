const sequelize = require("sequelize");
const { Medicine, Sale, Purchase, Category, Supplier, User, SaleItem } = require("../models");
const { Op } = require("sequelize");

exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const totalMedicines = await Medicine.count();
        const totalSales = await Sale.sum("total_amount") || 0;
        const totalPurchases = await Purchase.sum("total_amount") || 0;
        
        const lowStockCount = await Medicine.count({
            where: {
                stock_quantity: {
                    [Op.lte]: sequelize.col("low_stock_threshold")
                }
            }
        });

        const expiredCount = await Medicine.count({
            where: {
                expiry_date: {
                    [Op.lte]: today
                }
            }
        });

        const monthlySales = await Sale.sum("total_amount", {
            where: {
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        const latestSales = await Sale.findAll({
            limit: 5,
            order: [["createdAt", "DESC"]],
            include: [
                { model: SaleItem, as: "items", include: ["medicine"] },
                { model: User, as: "user", attributes: ["name"] }
            ]
        });

        res.json({
            totalMedicines,
            totalSales,
            totalPurchases,
            lowStockCount,
            expiredCount,
            monthlySales,
            latestSales
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};
