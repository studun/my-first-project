const { User, Category, Supplier, Medicine } = require("./models");
const sequelize = require("./config/database");
require("dotenv").config();

async function seed() {
    try {
        // Authenticate connection
        await sequelize.authenticate();
        console.log("Connected to database for seeding...");

        // Ensure tables exist without dropping them (Production safe)
        await sequelize.sync();

        // 1. Seed Admin User if none exists
        const adminEmail = "admin@pharmacy.com";
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        
        if (!existingAdmin) {
            await User.create({
                name: "System Admin",
                email: adminEmail,
                password: "admin123", // Model hook 'beforeSave' will handle hashing
                role: "admin"
            });
            console.log("✔ Admin user created.");
        } else {
            console.log("ℹ Admin user already exists, skipping...");
        }

        // 2. Seed Categories
        const categories = [
            { name: "Antibiotics", description: "Medicines that fight bacterial infections" },
            { name: "Painkillers", description: "Medicines that relieve pain" },
            { name: "Supplements", description: "Vitamins and minerals" }
        ];

        for (const cat of categories) {
            const [record, created] = await Category.findOrCreate({
                where: { name: cat.name },
                defaults: cat
            });
            if (created) console.log(`✔ Category '${cat.name}' created.`);
        }

        // 3. Seed Suppliers
        const suppliers = [
            { name: "PharmaCorp", phone: "123456789", email: "info@pharmacorp.com" },
            { name: "MediDist", phone: "987654321", email: "contact@medidist.com" }
        ];

        for (const sup of suppliers) {
            const [record, created] = await Supplier.findOrCreate({
                where: { name: sup.name },
                defaults: sup
            });
            if (created) console.log(`✔ Supplier '${sup.name}' created.`);
        }

        console.log("Seeding process finished.");
    } catch (err) {
        console.error("✘ Seeding error:", err);
    } finally {
        // Only exit if run as a standalone script
        if (require.main === module) {
            process.exit();
        }
    }
}

// Execute if run directly
if (require.main === module) {
    seed();
}

module.exports = seed;
