const bcrypt = require("bcryptjs");
const { User } = require("./models");
const sequelize = require("./config/database");

async function seed() {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { email: "admin@pharmacy.com" } });
    
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);
        
        await User.create({
            name: "System Admin",
            email: "admin@pharmacy.com",
            password: hashedPassword,
            role: "admin"
        });
        console.log("Admin user created: admin@pharmacy.com / admin123");
    } else {
        console.log("Admin user already exists");
    }
    process.exit();
}

seed();
