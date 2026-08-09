const User = require("./User");
const Category = require("./Category");
const Supplier = require("./Supplier");
const Medicine = require("./Medicine");
const Purchase = require("./Purchase");
const PurchaseItem = require("./PurchaseItem");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");
const sequelize = require("../config/database");

/**
 * ARCHITECTURAL NOTE ON ASSOCIATIONS:
 * We use 'onDelete: "RESTRICT"' for master data (User, Category, Supplier, Medicine) 
 * to prevent accidental deletion of historical financial records.
 * We use 'onDelete: "CASCADE"' for header-detail relationships (Sale -> SaleItem, Purchase -> PurchaseItem).
 */

// Category - Medicine
Category.hasMany(Medicine, { foreignKey: "categoryId", as: "medicines", onDelete: "RESTRICT" });
Medicine.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// Supplier - Medicine
Supplier.hasMany(Medicine, { foreignKey: "supplierId", as: "medicines", onDelete: "RESTRICT" });
Medicine.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

// User associations (Financial Integrity: Don't allow deleting users with existing sales/purchases)
User.hasMany(Sale, { foreignKey: "userId", as: "sales", onDelete: "RESTRICT" });
Sale.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Purchase, { foreignKey: "userId", as: "purchases", onDelete: "RESTRICT" });
Purchase.belongsTo(User, { foreignKey: "userId", as: "user" });

// Purchase - Supplier
Supplier.hasMany(Purchase, { foreignKey: "supplierId", as: "purchases", onDelete: "RESTRICT" });
Purchase.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

// Purchase - PurchaseItem (Header-Detail: Cascade is appropriate here)
Purchase.hasMany(PurchaseItem, { foreignKey: "purchaseId", as: "items", onDelete: "CASCADE" });
PurchaseItem.belongsTo(Purchase, { foreignKey: "purchaseId", as: "purchase" });

// Medicine - PurchaseItem
Medicine.hasMany(PurchaseItem, { foreignKey: "medicineId", as: "purchaseItems", onDelete: "RESTRICT" });
PurchaseItem.belongsTo(Medicine, { foreignKey: "medicineId", as: "medicine" });

// Sale - SaleItem (Header-Detail: Cascade is appropriate here)
Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items", onDelete: "CASCADE" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

// Medicine - SaleItem
Medicine.hasMany(SaleItem, { foreignKey: "medicineId", as: "saleItems", onDelete: "RESTRICT" });
SaleItem.belongsTo(Medicine, { foreignKey: "medicineId", as: "medicine" });

module.exports = {
    User,
    Category,
    Supplier,
    Medicine,
    Purchase,
    PurchaseItem,
    Sale,
    SaleItem,
    sequelize
};
