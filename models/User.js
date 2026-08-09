const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
    "User",
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
                notEmpty: true,
                len: [2, 50]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 100]
            }
        },
        role: {
            type: DataTypes.ENUM("admin", "pharmacist", "inventory_manager", "sales"),
            allowNull: false,
            defaultValue: "sales"
        }
    },
    {
        tableName: "users",
        timestamps: true,
        // Security: Exclude password from the default scope so it doesn't leak in API responses
        defaultScope: {
            attributes: { exclude: ["password"] }
        },
        scopes: {
            withPassword: {
                attributes: { include: ["password"] }
            }
        },
        hooks: {
            beforeSave: async (user) => {
                if (user.changed("password")) {
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
);

// Method to verify password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;