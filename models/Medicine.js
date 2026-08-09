const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Medicine = sequelize.define(
    "Medicine",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        generic_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        batch_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                isDate: true
                // In production, you might want a custom validator to prevent expired medicine entry
            }
        },
        buying_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
                isDecimal: true
            }
        },
        selling_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
                isDecimal: true
            }
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                isInt: true
            }
        },
        low_stock_threshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
            validate: {
                min: 0,
                isInt: true
            }
        },
        side_effects: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "medicines",
        timestamps: true,
        indexes: [
            { fields: ["name"] },
            { fields: ["barcode"] },
            { fields: ["expiry_date"] }
        ]
    }
);

module.exports = Medicine;
