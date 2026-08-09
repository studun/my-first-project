const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SaleItem = sequelize.define(
    "SaleItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                isInt: true
            }
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
                isDecimal: true
            }
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0,
                isDecimal: true
            }
        }
    },
    {
        tableName: "sale_items",
        timestamps: true
    }
);

module.exports = SaleItem;
