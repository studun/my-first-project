const { Purchase, PurchaseItem, Medicine, Supplier, sequelize } = require("../models");

exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: Supplier, as: "supplier" },
                {
                    model: PurchaseItem,
                    as: "items",
                    include: [{ model: Medicine, as: "medicine" }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(purchases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

exports.createPurchase = async (req, res) => {
    const { supplierId, invoice_number, items } = req.body;

    if (!supplierId || !invoice_number || !items || items.length === 0) {
        return res.status(400).json({ msg: "Please provide all required fields and at least one item" });
    }

    const t = await sequelize.transaction();

    try {
        let total_amount = 0;
        for (const item of items) {
            total_amount += (parseInt(item.quantity) * parseFloat(item.unit_price));
        }

        const purchase = await Purchase.create({
            supplierId,
            invoice_number,
            total_amount
        }, { transaction: t });

        for (const item of items) {
            const qty = parseInt(item.quantity);
            const price = parseFloat(item.unit_price);

            await PurchaseItem.create({
                purchaseId: purchase.id,
                medicineId: item.medicineId,
                quantity: qty,
                unit_price: price,
                total_price: qty * price
            }, { transaction: t });

            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
            
            if (!medicine) {
                throw new Error(`Medicine with ID ${item.medicineId} not found`);
            }

            medicine.stock_quantity = Number(medicine.stock_quantity) + qty;
            await medicine.save({ transaction: t });
        }

        await t.commit();

        const fullPurchase = await Purchase.findByPk(purchase.id, {
            include: [
                { model: Supplier, as: "supplier" },
                { model: PurchaseItem, as: "items", include: ["medicine"] }
            ]
        });

        return res.status(201).json({
            success: true,
            msg: "Purchase recorded and stock updated successfully",
            purchase: fullPurchase
        });

    } catch (err) {
        await t.rollback();
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            msg: "Error saving purchase", 
            error: err.message 
        });
    }
};