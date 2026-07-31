const User = require("./User");
const Category = require("./Category");
const Supplier = require("./Supplier");
const Medicine = require("./Medicine");
const Purchase = require("./Purchase");
const PurchaseItem = require("./PurchaseItem");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");

// Category - Medicine
Category.hasMany(Medicine, { foreignKey: "categoryId", as: "medicines" });
Medicine.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// Supplier - Medicine
Supplier.hasMany(Medicine, { foreignKey: "supplierId", as: "medicines" });
Medicine.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

// Purchase - Supplier
Supplier.hasMany(Purchase, { foreignKey: "supplierId", as: "purchases" });
Purchase.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

// Purchase - PurchaseItem
Purchase.hasMany(PurchaseItem, { foreignKey: "purchaseId", as: "items" });
PurchaseItem.belongsTo(Purchase, { foreignKey: "purchaseId", as: "purchase" });

// Medicine - PurchaseItem
Medicine.hasMany(PurchaseItem, { foreignKey: "medicineId", as: "purchaseItems" });
PurchaseItem.belongsTo(Medicine, { foreignKey: "medicineId", as: "medicine" });

// Sale - SaleItem
Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

// Medicine - SaleItem
Medicine.hasMany(SaleItem, { foreignKey: "medicineId", as: "saleItems" });
SaleItem.belongsTo(Medicine, { foreignKey: "medicineId", as: "medicine" });

module.exports = {
    User,
    Category,
    Supplier,
    Medicine,
    Purchase,
    PurchaseItem,
    Sale,
    SaleItem
};
