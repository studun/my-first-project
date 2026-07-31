const { INITIALLY_DEFERRED } = require('sequelize/lib/deferrable');
const { Sale, SaleItem, Medicine, sequelize } = require('../models'); // تأكد من مسارات النماذج لديك

exports.createSale = async (req, res) => {
    // بدء Transaction لحماية البيانات
    const t = await sequelize.transaction();
    
    try {
        const { items } = req.body; // يتوقع مصفوفة تحتوي على [{ medicineId, quantity, price }]
        let total_amount = 0;
        const processedItems = [];

        // 1. التحقق من الأدوية والمخزون وحساب السعر
        for (const item of items) {
            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });

            if (!medicine) {
                await t.rollback();
                return res.status(404).json({ error: Medicine with ID ${item.medicineId} not found });
            }

            if (medicine.stock_quantity < item.quantity) {
                await t.rollback();
                return res.status(400).json({ error: Insufficient stock for medicine: ${medicine.name} });
            }

            const itemPrice = item.price  medicine.price  0;
            total_amount += itemPrice * item.quantity;

            processedItems.push({
                medicineId: medicine.id,
                quantity: item.quantity,
                price: itemPrice,
                medicine: medicine // سنحتاجه لتحديث المخزون لاحقاً
            });
        }

        // 2. إنشاء الفاتورة الرئيسية
        const sale = await Sale.create({ total_amount }, { transaction: t });

        // 3. إنشاء تفاصيل الفاتورة وتحديث المخزون
        for (const pItem of processedItems) {
            await SaleItem.create({
                saleId: sale.id,
                medicineId: pItem.medicineId,
                quantity: pItem.quantity,
                price: pItem.price
            }, { transaction: t });

            // خصم الكمية من المخزون
            await pItem.medicine.update({
                stock_quantity: pItem.medicine.stock_quantity - pItem.quantity
            }, { transaction: t });
        }

        // اعتماد العملية بنجاح
        await t.commit();
        
        return res.status(201).json({
            message: "Sale processed successfully",
            saleId: sale.id,
            total_amount
        });

    } catch (error) {
        // إلغاء العملية كاملة في حال حدوث أي خطأ
        await t.rollback();
        return res.status(500).json({ error: error.message });
    }
};

// استعراض جميع المبيعات
exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({ include: [{ model: SaleItem }] });
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
