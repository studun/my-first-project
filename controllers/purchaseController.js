const { Purchase, PurchaseItem, Medicine, Supplier, sequelize } = require("../models");

/**
 * @desc    Get all purchase history
 */
exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: Supplier, as: "supplier", attributes: ["name"] },
                {
                    model: PurchaseItem,
                    as: "items",
                    include: [{ model: Medicine, as: "medicine", attributes: ["name", "barcode"] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, count: purchases.length, purchases: purchases || [] });
    } catch (err) {
        console.error(`[Purchase GetAll Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch purchase history", purchases: [] });
    }
};

/**
 * @desc    Record a new purchase and update stock
 */
exports.createPurchase = async (req, res) => {
    console.log("RECEIVED PAYLOAD:", req.body);
    const { supplierId, invoice_number, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
    }

    const t = await sequelize.transaction();

    try {
        let total_amount = 0;
        
        // 1. Calculate total and validate medicines
        for (const item of items) {
            const qty = parseInt(item.quantity, 10);
            const price = parseFloat(item.unit_price);
            const medId = parseInt(item.medicineId, 10);
            if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0 || isNaN(medId)) {
                throw new Error("Invalid quantity, price, or medicine ID in items list");
            }
            total_amount += (qty * price);
        }

        // 2. Create Purchase Header
        const purchase = await Purchase.create({
            supplierId: supplierId ? parseInt(supplierId, 10) : null,
            invoice_number,
            total_amount,
            userId: req.user.id
        }, { transaction: t });

        // 3. Create Items and Update Stock
        for (const item of items) {
            const qty = parseInt(item.quantity, 10);
            const price = parseFloat(item.unit_price);
            const medId = parseInt(item.medicineId, 10);

            await PurchaseItem.create({
                purchaseId: purchase.id,
                medicineId: medId,
                quantity: qty,
                unit_price: price,
                total_price: qty * price
            }, { transaction: t });

            const medicine = await Medicine.findByPk(medId, { transaction: t });
            if (!medicine) {
                throw new Error(`Medicine with ID ${medId} not found`);
            }

            // Atomic stock update
            await medicine.increment("stock_quantity", { by: qty, transaction: t });
        }

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Purchase recorded and stock updated successfully",
            purchaseId: purchase.id
        });

    } catch (err) {
        await t.rollback();
        console.error("PURCHASE ERROR:", err);
        res.status(400).json({ error: err.message || err.toString() });
    }
};
