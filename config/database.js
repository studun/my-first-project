const { Sequelize } = require("sequelize");
require("dotenv").config();

const isDevelopment = process.env.NODE_ENV === "development";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306", 10),
        dialect: "mysql",
        // Environment-specific logging: Log queries in development for easier debugging, disable in production for performance
        logging: isDevelopment ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
        
        // Production connection pooling to manage concurrent client traffic and prevent connection exhaustion
        pool: {
            max: parseInt(process.env.DB_POOL_MAX || "10", 10),
            min: parseInt(process.env.DB_POOL_MIN || "0", 10),
            acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000", 10),
            idle: parseInt(process.env.DB_POOL_IDLE || "10000", 10)
        },
        
        // Conditional SSL configuration for cloud managed database services (AWS RDS, DigitalOcean, etc.)
        dialectOptions: process.env.DB_SSL === "true" ? {
            ssl: {
                require: true,
                rejectUnauthorized: false // Adjust to true if standard CA certificates are configured
            }
        } : {}
    }
);

module.exports = sequelize;
