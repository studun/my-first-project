const { Sale, SaleItem, Medicine, sequelize } = require("../models");

exports.createSale = async (req, res) => {
    const { items, customer_name, payment_type } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ msg: "Please provide at least one item for the sale" });
    }

    const t = await sequelize.transaction();
    
    try {
        let total_amount = 0;
        const processedItems = [];

        for (const item of items) {
            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });

            if (!medicine) {
                throw new Error(`Medicine with ID ${item.medicineId} not found`);
            }

            const quantity = parseInt(item.quantity);
            if (medicine.stock_quantity < quantity) {
                throw new Error(`Insufficient stock for medicine: ${medicine.name} (Available: ${medicine.stock_quantity})`);
            }

            const unitPrice = parseFloat(item.unit_price) || parseFloat(medicine.selling_price);
            const itemTotal = unitPrice * quantity;
            total_amount += itemTotal;

            processedItems.push({
                medicineId: medicine.id,
                quantity: quantity,
                unit_price: unitPrice,
                total_price: itemTotal,
                medicine: medicine
            });
        }

        const sale = await Sale.create({ 
            total_amount, 
            customer_name: customer_name || "Guest", 
            payment_type: payment_type || "cash" 
        }, { transaction: t });

        for (const pItem of processedItems) {
            await SaleItem.create({
                saleId: sale.id,
                medicineId: pItem.medicineId,
                quantity: pItem.quantity,
                unit_price: pItem.unit_price,
                total_price: pItem.total_price
            }, { transaction: t });

            await pItem.medicine.update({
                stock_quantity: pItem.medicine.stock_quantity - pItem.quantity
            }, { transaction: t });
        }

        await t.commit();

        const fullSale = await Sale.findByPk(sale.id, {
            include: [
                { 
                    model: SaleItem, 
                    as: "items",
                    include: [{ model: Medicine, as: "medicine" }] 
                }
            ]
        });
        
        return res.status(201).json({
            success: true,
            message: "Sale processed successfully",
            sale: fullSale
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(400).json({ success: false, msg: error.message });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({ 
            include: [
                { 
                    model: SaleItem, 
                    as: "items",
                    include: [{ model: Medicine, as: "medicine" }] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
};
