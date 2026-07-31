const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Purchase = sequelize.define(
    "Purchase",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        purchase_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        invoice_number: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "purchases",
        timestamps: true
    }
);

module.exports = Purchase;
