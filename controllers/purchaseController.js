const { Purchase, PurchaseItem, Medicine, sequelize } = require("../models");

// 1. جلب جميع المشتريات
exports.getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                "supplier",
                {
                    model: PurchaseItem,
                    as: "items",
                    include: ["medicine"]
                }
            ]
        });

        res.json(purchases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

// 2. إنشاء فاتورة مشتريات جديدة وتحديث المخزن
exports.createPurchase = async (req, res) => {
    const { supplierId, invoice_number, items } = req.body;

    // بدء المعاملة (Transaction) لضمان سلامة البيانات
    const t = await sequelize.transaction();

    try {
        // حساب الإجمالي الكلي للفاتورة
        let total_amount = 0;
        items.forEach(item => {
            const qty = parseInt(item.quantity, 10);
            const price = parseFloat(item.unit_price);
            total_amount += qty * price;
        });

        // إنشاء الفاتورة الرئيسية
        const purchase = await Purchase.create({
            supplierId,
            invoice_number,
            total_amount
        }, { transaction: t });

        // المرور على الأدوية لحفظها وتحديث كمياتها في المخزن
        for (const item of items) {
            const qty = parseInt(item.quantity, 10);
            const price = parseFloat(item.unit_price);

            // حفظ عنصر المشتريات
            await PurchaseItem.create({
                purchaseId: purchase.id,
                medicineId: item.medicineId,
                quantity: qty,
                unit_price: price,
                total_price: qty * price
            }, { transaction: t });

            // جلب الدواء لتحديث كميته في المخزن بالاعتماد على حقل stock_quantity
            const medicine = await Medicine.findByPk(item.medicineId, { transaction: t });
            
            if (!medicine) {
                throw new Error(`الدواء ذو المعرف ${item.medicineId} غير موجود في النظام`);
            }

            // زيادة المخزن بالكمية الجديدة
            medicine.stock_quantity = Number(medicine.stock_quantity) + qty;
            await medicine.save({ transaction: t });
        }

        // تثبيت كافة العمليات بنجاح
        await t.commit();

        return res.status(201).json({
            success: true,
            msg: "تم تسجيل فاتورة المشتريات وتحديث المخزن بنجاح",
            purchase
        });

    } catch (err) {
        // التراجع فوراً وإلغاء التعديلات في حال حدوث أي خطأ
        await t.rollback();
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            msg: "حدث خطأ في السيرفر أثناء حفظ المشتريات", 
            error: err.message 
        });
    }
};