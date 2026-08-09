const { Sale, SaleItem, Medicine, sequelize } = require("../models");

/**
 * @desc    Process a new sale and update stock
 */
exports.createSale = async (req, res) => {
    const { items, customer_name, payment_type } = req.body;
    const user_id = req.user ? (req.user.id || req.user.user_id) : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "At least one item is required" });
    }

    const t = await sequelize.transaction();

    try {
        let total_amount = 0;
        const itemsToProcess = [];

        // 1. Validate all medicines exist and have sufficient stock
        for (const item of items) {
            const qty = parseInt(item.quantity, 10);
            if (isNaN(qty) || qty <= 0) {
                throw new Error("Invalid quantity in items list");
            }

            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
            if (!medicine) {
                throw new Error(`Medicine with ID ${item.medicineId} not found`);
            }

            if (medicine.stock_quantity < qty) {
                throw new Error(`Insufficient stock for medicine: ${medicine.name}. Available: ${medicine.stock_quantity}, requested: ${qty}`);
            }

            const price = parseFloat(medicine.selling_price || 0);
            total_amount += (qty * price);

            itemsToProcess.push({
                medicine,
                quantity: qty,
                price
            });
        }

        // 2. Create Sale Header
        const sale = await Sale.create({
            total_amount,
            customer_name: customer_name || "Walk-in Customer",
            payment_type: payment_type || "cash",
            userId: user_id
        }, { transaction: t });

        // 3. Create Sale Items and Deduct Stock
        for (const proc of itemsToProcess) {
            await SaleItem.create({
                saleId: sale.id,
                medicineId: proc.medicine.id,
                quantity: proc.quantity,
                unit_price: proc.price,
                total_price: proc.quantity * proc.price
            }, { transaction: t });

            // Atomic stock update in database
            await proc.medicine.decrement("stock_quantity", { by: proc.quantity, transaction: t });
        }

        await t.commit();

        res.status(201).json({
            success: true,
            message: "Sale completed successfully",
            saleId: sale.id,
            total_amount
        });

    } catch (err) {
        await t.rollback();
        console.error(`[Sale Create Error]: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all sales history
 */
exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({ 
            include: [
                { 
                    model: SaleItem, 
                    as: "items",
                    include: [{ model: Medicine, as: "medicine", attributes: ["name"] }] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, count: sales.length, sales: sales || [] });
    } catch (err) {
        console.error(`[Sale GetAll Error]: ${err.message}`);
        res.status(500).json({ success: false, message: "Failed to fetch sales history", sales: [] });
    }
};
