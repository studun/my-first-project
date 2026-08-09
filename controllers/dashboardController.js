const { Medicine, Sale, Purchase, SaleItem, User, sequelize } = require("../models");
const { Op, col } = require("sequelize");

/**
 * @desc    Get dashboard statistics
 */
exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Execute all independent stats queries in parallel
        const results = await Promise.all([
            Medicine.count(),
            Sale.sum("total_amount"),
            Purchase.sum("total_amount"),
            Medicine.count({
                where: {
                    stock_quantity: { [Op.lte]: col("low_stock_threshold") }
                }
            }),
            Medicine.count({
                where: {
                    expiry_date: { [Op.lte]: today }
                }
            }),
            Sale.sum("total_amount", {
                where: {
                    createdAt: { [Op.gte]: startOfMonth }
                }
            }),
            Sale.findAll({
                limit: 5,
                order: [["createdAt", "DESC"]],
                include: [
                    { model: SaleItem, as: "items", include: ["medicine"] },
                    { model: User, as: "user", attributes: ["name"] }
                ]
            })
        ]);

        const [
            totalMedicines,
            totalSales,
            totalPurchases,
            lowStockCount,
            expiredCount,
            monthlySales,
            latestSales
        ] = results;

        res.json({
            success: true,
            stats: {
                totalMedicines,
                totalSales: totalSales || 0,
                totalPurchases: totalPurchases || 0,
                lowStockCount,
                expiredCount,
                monthlySales: monthlySales || 0,
                latestSales: latestSales || []
            }
        });
    } catch (err) {
        console.error(`[Dashboard Stats Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }
};
