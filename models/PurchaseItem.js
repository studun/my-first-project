const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PurchaseItem = sequelize.define(
    "PurchaseItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        tableName: "purchase_items",
        timestamps: true
    }
);

module.exports = PurchaseItem;
