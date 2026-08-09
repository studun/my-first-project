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
            defaultValue: DataTypes.NOW,
            validate: {
                isDate: true
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: {
                min: 0,
                isDecimal: true
            }
        },
        invoice_number: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "purchases",
        timestamps: true,
        indexes: [
            { fields: ["purchase_date"] },
            { fields: ["invoice_number"] }
        ]
    }
);

module.exports = Purchase;
