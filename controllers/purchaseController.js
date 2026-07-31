const { Purchase, PurchaseItem, Medicine, sequelize } = require("../models");

exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: ["supplier", { model: PurchaseItem, as: "items", include: ["medicine"] }]
        });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.createPurchase = async (req, res) => {
    const { supplierId, invoice_number, items } = req.body;
    // items: [{ medicineId, quantity, unit_price }]

    const t = await sequelize.transaction();

    try {
        let total_amount = 0;
        items.forEach(item => {
            total_amount += item.quantity * item.unit_price;
        });

        const purchase = await Purchase.create({
            supplierId,
            invoice_number,
            total_amount
        }, { transaction: t });

        for (const item of items) {
            await PurchaseItem.create({
                purchaseId: purchase.id,
                medicineId: item.medicineId,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price
            }, { transaction: t });

            // Update Medicine Stock
            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
            if (medicine) {
                medicine.stock_quantity += parseInt(item.quantity);
                medicine.buying_price = item.unit_price; // Update last buying price
                await medicine.save({ transaction: t });
            }
        }

        await t.commit();
        res.json(purchase);
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};
