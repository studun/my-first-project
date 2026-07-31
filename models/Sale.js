const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define(
    "Sale",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sale_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        payment_type: {
            type: DataTypes.ENUM("cash", "card", "other"),
            defaultValue: "cash"
        }
    },
    {
        tableName: "sales",
        timestamps: true
    }
);

module.exports = Sale;
