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
            allowNull: false
        },
        generic_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        batch_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        buying_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        selling_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        low_stock_threshold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10
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
        timestamps: true
    }
);

module.exports = Medicine;
