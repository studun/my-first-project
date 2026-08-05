const bcrypt = require("bcryptjs");
const { User, Category, Supplier, Medicine } = require("./models");
const sequelize = require("./config/database");

async function seed() {
    try {
        await sequelize.sync({ force: true });
        console.log("Database synced (forced)");

        // 1. Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);
        
        const admin = await User.create({
            name: "System Admin",
            email: "admin@pharmacy.com",
            password: hashedPassword,
            role: "admin"
        });
        console.log("Admin user created");

        // 2. Categories
        const cat1 = await Category.create({ name: "Antibiotics", description: "Medicines that fight bacterial infections" });
        const cat2 = await Category.create({ name: "Painkillers", description: "Medicines that relieve pain" });
        console.log("Categories created");

        // 3. Suppliers
        const sup1 = await Supplier.create({ name: "PharmaCorp", phone: "123456789", email: "info@pharmacorp.com" });
        const sup2 = await Supplier.create({ name: "MediDist", phone: "987654321", email: "contact@medidist.com" });
        console.log("Suppliers created");

        // 4. Medicines
        await Medicine.create({
            name: "Amoxicillin",
            generic_name: "Amoxicillin 500mg",
            categoryId: cat1.id,
            supplierId: sup1.id,
            buying_price: 5.00,
            selling_price: 10.00,
            stock_quantity: 50,
            expiry_date: "2027-12-31"
        });

        await Medicine.create({
            name: "Paracetamol",
            generic_name: "Acetaminophen 500mg",
            categoryId: cat2.id,
            supplierId: sup2.id,
            buying_price: 2.00,
            selling_price: 5.00,
            stock_quantity: 100,
            expiry_date: "2026-06-30"
        });
        console.log("Medicines created");

        console.log("Seeding completed successfully!");
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        process.exit();
    }
}

seed();
