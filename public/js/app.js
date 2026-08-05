const sectionContent = document.getElementById("section-content");
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = e.target.getAttribute("data-section");
        navLinks.forEach(l => l.classList.remove("active"));
        e.target.classList.add("active");
        loadSection(section);
    });
});

async function loadSection(section) {
    sectionContent.innerHTML = '<div class="text-center mt-5"><div class="spinner-border" role="status"></div></div>';

    switch (section) {
        case "dashboard":
            await renderDashboard();
            break;
        case "medicines":
            await renderMedicines();
            break;
        case "categories":
            await renderCategories();
            break;
        case "suppliers":
            await renderSuppliers();
            break;
        case "purchases":
            await renderPurchases();
            break;
        case "sales":
            await renderSales();
            break;
        default:
            sectionContent.innerHTML = "<h2>Section under construction</h2>";
    }
}

async function renderDashboard() {
    try {
        const stats = await apiRequest("/dashboard/stats");
        sectionContent.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white stats-card shadow p-3">
                        <h5>Total Medicines</h5>
                        <h3>${stats.totalMedicines}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white stats-card shadow p-3">
                        <h5>Total Sales</h5>
                        <h3>$${stats.totalSales}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-dark stats-card shadow p-3">
                        <h5>Low Stock</h5>
                        <h3>${stats.lowStockCount}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white stats-card shadow p-3">
                        <h5>Total Purchases</h5>
                        <h3>$${stats.totalPurchases}</h3>
                    </div>
                </div>
            </div>
            <div class="card shadow p-4 mt-4">
                <h4>Recent Sales</h4>
                <table class="table table-striped mt-3">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.latestSales.map(sale => `
                            <tr>
                                <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
                                <td>${sale.customer_name || "N/A"}</td>
                                <td>$${sale.total_amount}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info" onclick='viewSaleDetails(${JSON.stringify(sale.items).replace(/'/g, "&apos;")})'>
                                        ${sale.items ? sale.items.length : 0} items
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function renderMedicines() {
    try {
        const medicines = await apiRequest("/medicines");
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Medicines</h2>
                <button class="btn btn-primary" onclick="showAddMedicineModal()">Add Medicine</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Generic Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Expiry</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${medicines.map(med => `
                            <tr>
                                <td>${med.name}</td>
                                <td>${med.generic_name || "-"}</td>
                                <td>${med.category ? med.category.name : "N/A"}</td>
                                <td>${med.stock_quantity}</td>
                                <td>$${med.selling_price}</td>
                                <td>${med.expiry_date}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="editMedicine(${med.id})">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${med.id})">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function renderCategories() {
     try {
        const categories = await apiRequest("/categories");
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <button class="btn btn-primary" onclick="showCategoryModal()">Add Category</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(cat => `
                            <tr>
                                <td>${cat.id}</td>
                                <td>${cat.name}</td>
                                <td>${cat.description || "-"}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="showCategoryModal(${cat.id})">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function renderSuppliers() {
    try {
        const suppliers = await apiRequest("/suppliers");
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Suppliers</h2>
                <button class="btn btn-primary" onclick="showSupplierModal()">Add Supplier</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.map(sup => `
                            <tr>
                                <td>${sup.name}</td>
                                <td>${sup.phone}</td>
                                <td>${sup.email || "-"}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="showSupplierModal(${sup.id})">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${sup.id})">Delete</button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function renderPurchases() {
    try {
        const purchases = await apiRequest("/purchases");
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Purchases</h2>
                <button class="btn btn-primary" onclick="addPurchase()">New Purchase</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Supplier</th>
                            <th>Invoice #</th>
                            <th>Total</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchases.map(p => `
                            <tr>
                                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                                <td>${p.supplier ? p.supplier.name : "N/A"}</td>
                                <td>${p.invoice_number || "-"}</td>
                                <td>$${p.total_amount}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info" onclick='viewPurchaseDetails(${JSON.stringify(p.items).replace(/'/g, "&apos;")})'>
                                        ${p.items ? p.items.length : 0} items
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function renderSales() {
    try {
        const sales = await apiRequest("/sales");
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Sales</h2>
                <button class="btn btn-success" onclick="addSale()">New Sale</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(s => `
                            <tr>
                                <td>${new Date(s.createdAt).toLocaleDateString()}</td>
                                <td>${s.customer_name || "Guest"}</td>
                                <td>$${s.total_amount}</td>
                                <td><span class="badge bg-secondary">${s.payment_type}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info" onclick='viewSaleDetails(${JSON.stringify(s.items).replace(/'/g, "&apos;")})'>
                                        ${s.items ? s.items.length : 0} items
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

async function addPurchase() {
    try {
        const [suppliers, medicines] = await Promise.all([
            apiRequest("/suppliers"),
            apiRequest("/medicines")
        ]);

        const modalHtml = `
            <div class="modal fade" id="purchaseModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">New Purchase</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="purchase-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Supplier</label>
                                        <select class="form-select" id="purchase-supplier" required>
                                            <option value="">Select Supplier</option>
                                            ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Invoice Number</label>
                                        <input type="text" class="form-control" id="purchase-invoice" required>
                                    </div>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5>Items</h5>
                                    <button type="button" class="btn btn-success btn-sm" id="add-item-btn">Add Item</button>
                                </div>
                                <div id="purchase-items-container">
                                    <div class="row g-2 mb-2 purchase-item-row">
                                        <div class="col-md-5">
                                            <select class="form-select medicine-select" required>
                                                <option value="">Select Medicine</option>
                                                ${medicines.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <input type="number" class="form-control qty-input" placeholder="Qty" min="1" required>
                                        </div>
                                        <div class="col-md-3">
                                            <input type="number" step="0.01" class="form-control price-input" placeholder="Unit Price" min="0" required>
                                        </div>
                                        <div class="col-md-1">
                                            <button type="button" class="btn btn-outline-danger btn-sm remove-item">×</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <h4>Total: $<span id="purchase-total-display">0.00</span></h4>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-purchase-btn">Save Purchase</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldModal = document.getElementById('purchaseModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('purchaseModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        const container = document.getElementById('purchase-items-container');
        const totalDisplay = document.getElementById('purchase-total-display');

        const updateTotal = () => {
            let total = 0;
            container.querySelectorAll('.purchase-item-row').forEach(row => {
                const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
                const price = parseFloat(row.querySelector('.price-input').value) || 0;
                total += qty * price;
            });
            totalDisplay.textContent = total.toFixed(2);
        };

        const setupEvents = (row) => {
            row.querySelector('.qty-input').addEventListener('input', updateTotal);
            row.querySelector('.price-input').addEventListener('input', updateTotal);
            row.querySelector('.remove-item').addEventListener('click', () => {
                if (container.querySelectorAll('.purchase-item-row').length > 1) {
                    row.remove();
                    updateTotal();
                }
            });
        };

        setupEvents(container.querySelector('.purchase-item-row'));

        document.getElementById('add-item-btn').addEventListener('click', () => {
            const firstRow = container.querySelector('.purchase-item-row');
            const newRow = firstRow.cloneNode(true);
            newRow.querySelectorAll('input').forEach(i => i.value = '');
            newRow.querySelector('select').value = '';
            container.appendChild(newRow);
            setupEvents(newRow);
        });

        document.getElementById('save-purchase-btn').addEventListener('click', async () => {
            const supplierId = document.getElementById('purchase-supplier').value;
            const invoice_number = document.getElementById('purchase-invoice').value;
            const itemRows = document.querySelectorAll('.purchase-item-row');
            
            const items = Array.from(itemRows).map(row => ({
                medicineId: row.querySelector('.medicine-select').value,
                quantity: row.querySelector('.qty-input').value,
                unit_price: row.querySelector('.price-input').value
            }));

            if (!supplierId || !invoice_number || items.some(i => !i.medicineId || !i.quantity || !i.unit_price)) {
                alert("Please fill all fields");
                return;
            }

            try {
                await apiRequest("/purchases", "POST", { supplierId, invoice_number, items });
                modal.hide();
                await renderPurchases();
            } catch (err) {
                alert(err.message);
            }
        });

    } catch (err) {
        alert(err.message);
    }
}

async function addSale() {
    try {
        const medicines = await apiRequest("/medicines");

        const modalHtml = `
            <div class="modal fade" id="saleModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">New Sale</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="sale-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Customer Name</label>
                                        <input type="text" class="form-control" id="sale-customer" placeholder="Guest">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Payment Type</label>
                                        <select class="form-select" id="sale-payment">
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5>Items</h5>
                                    <button type="button" class="btn btn-primary btn-sm" id="add-sale-item-btn">Add Item</button>
                                </div>
                                <div id="sale-items-container">
                                    <div class="row g-2 mb-2 sale-item-row">
                                        <div class="col-md-5">
                                            <select class="form-select medicine-select" required>
                                                <option value="">Select Medicine</option>
                                                ${medicines.map(m => `<option value="${m.id}" data-price="${m.selling_price}">${m.name} ($${m.selling_price})</option>`).join("")}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <input type="number" class="form-control qty-input" placeholder="Qty" min="1" required>
                                        </div>
                                        <div class="col-md-3">
                                            <input type="number" step="0.01" class="form-control price-input" placeholder="Price" readonly>
                                        </div>
                                        <div class="col-md-1">
                                            <button type="button" class="btn btn-outline-danger btn-sm remove-item">×</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-end mt-3">
                                    <h4>Total: $<span id="sale-total-display">0.00</span></h4>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success" id="save-sale-btn">Complete Sale</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldModal = document.getElementById('saleModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('saleModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        const container = document.getElementById('sale-items-container');
        const totalDisplay = document.getElementById('sale-total-display');

        const updateTotal = () => {
            let total = 0;
            container.querySelectorAll('.sale-item-row').forEach(row => {
                const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
                const price = parseFloat(row.querySelector('.price-input').value) || 0;
                total += qty * price;
            });
            totalDisplay.textContent = total.toFixed(2);
        };

        const setupRowEvents = (row) => {
            row.querySelector('.medicine-select').addEventListener('change', (e) => {
                const selected = e.target.options[e.target.selectedIndex];
                const price = selected.getAttribute('data-price') || 0;
                row.querySelector('.price-input').value = price;
                updateTotal();
            });
            row.querySelector('.qty-input').addEventListener('input', updateTotal);
            row.querySelector('.remove-item').addEventListener('click', () => {
                if (container.querySelectorAll('.sale-item-row').length > 1) {
                    row.remove();
                    updateTotal();
                }
            });
        };

        setupRowEvents(container.querySelector('.sale-item-row'));

        document.getElementById('add-sale-item-btn').addEventListener('click', () => {
            const firstRow = container.querySelector('.sale-item-row');
            const newRow = firstRow.cloneNode(true);
            newRow.querySelectorAll('input').forEach(i => i.value = '');
            newRow.querySelector('select').value = '';
            container.appendChild(newRow);
            setupRowEvents(newRow);
        });

        document.getElementById('save-sale-btn').addEventListener('click', async () => {
            const customer_name = document.getElementById('sale-customer').value;
            const payment_type = document.getElementById('sale-payment').value;
            const itemRows = document.querySelectorAll('.sale-item-row');
            
            const items = Array.from(itemRows).map(row => ({
                medicineId: row.querySelector('.medicine-select').value,
                quantity: row.querySelector('.qty-input').value,
                unit_price: row.querySelector('.price-input').value
            }));

            if (items.some(i => !i.medicineId || !i.quantity)) {
                alert("Please fill all item fields");
                return;
            }

            try {
                await apiRequest("/sales", "POST", { customer_name, payment_type, items });
                modal.hide();
                await renderSales();
            } catch (err) {
                alert(err.message);
            }
        });

    } catch (err) {
        alert(err.message);
    }
}

function viewSaleDetails(items) {
    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.medicine ? item.medicine.name : "Unknown"}</td>
            <td>${item.quantity}</td>
            <td>$${item.unit_price}</td>
            <td>$${item.total_price}</td>
        </tr>
    `).join("");

    const modalHtml = `
        <div class="modal fade" id="detailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Sale Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${itemsHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    const oldModal = document.getElementById('detailsModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    new bootstrap.Modal(document.getElementById('detailsModal')).show();
}

function viewPurchaseDetails(items) {
    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.medicine ? item.medicine.name : "Unknown"}</td>
            <td>${item.quantity}</td>
            <td>$${item.unit_price}</td>
            <td>$${item.total_price}</td>
        </tr>
    `).join("");

    const modalHtml = `
        <div class="modal fade" id="purchaseDetailsModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Purchase Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${itemsHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    const oldModal = document.getElementById('purchaseDetailsModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    new bootstrap.Modal(document.getElementById('purchaseDetailsModal')).show();
}

async function showCategoryModal(id = null) {
    let category = null;
    if (id) {
        const categories = await apiRequest("/categories");
        category = categories.find(c => c.id === id);
    }

    const modalHtml = `
        <div class="modal fade" id="categoryModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${category ? "Edit" : "Add"} Category</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="category-form">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" id="cat-name" value="${category ? category.name : ""}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="cat-description">${category ? (category.description || "") : ""}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-category-btn">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const oldModal = document.getElementById('categoryModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();

    document.getElementById('save-category-btn').addEventListener('click', async () => {
        const name = document.getElementById('cat-name').value;
        const description = document.getElementById('cat-description').value;
        
        if (!name) return alert("Name is required");

        try {
            const method = category ? "PUT" : "POST";
            const endpoint = category ? `/categories/${category.id}` : "/categories";
            await apiRequest(endpoint, method, { name, description });
            modal.hide();
            await renderCategories();
        } catch (err) {
            alert(err.message);
        }
    });
}

async function deleteCategory(id) {
    if (confirm("Are you sure?")) {
        try {
            await apiRequest(`/categories/${id}`, "DELETE");
            await renderCategories();
        } catch (err) {
            alert(err.message);
        }
    }
}

async function showSupplierModal(id = null) {
    let supplier = null;
    if (id) {
        const suppliers = await apiRequest("/suppliers");
        supplier = suppliers.find(s => s.id === id);
    }

    const modalHtml = `
        <div class="modal fade" id="supplierModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${supplier ? "Edit" : "Add"} Supplier</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="supplier-form">
                            <div class="mb-2">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" id="sup-name" value="${supplier ? supplier.name : ""}" required>
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Phone</label>
                                <input type="text" class="form-control" id="sup-phone" value="${supplier ? supplier.phone : ""}" required>
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="sup-email" value="${supplier ? (supplier.email || "") : ""}">
                            </div>
                            <div class="mb-2">
                                <label class="form-label">Address</label>
                                <textarea class="form-control" id="sup-address">${supplier ? (supplier.address || "") : ""}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-supplier-btn">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const oldModal = document.getElementById('supplierModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
    modal.show();

    document.getElementById('save-supplier-btn').addEventListener('click', async () => {
        const name = document.getElementById('sup-name').value;
        const phone = document.getElementById('sup-phone').value;
        const email = document.getElementById('sup-email').value;
        const address = document.getElementById('sup-address').value;
        
        if (!name || !phone) return alert("Name and Phone are required");

        try {
            const method = supplier ? "PUT" : "POST";
            const endpoint = supplier ? `/suppliers/${supplier.id}` : "/suppliers";
            await apiRequest(endpoint, method, { name, phone, email, address });
            modal.hide();
            await renderSuppliers();
        } catch (err) {
            alert(err.message);
        }
    });
}

async function deleteSupplier(id) {
    if (confirm("Are you sure?")) {
        try {
            await apiRequest(`/suppliers/${id}`, "DELETE");
            await renderSuppliers();
        } catch (err) {
            alert(err.message);
        }
    }
}

async function showAddMedicineModal(medId = null) {
    try {
        const [categories, suppliers] = await Promise.all([
            apiRequest("/categories"),
            apiRequest("/suppliers")
        ]);

        let medicine = null;
        if (medId) {
            const medicines = await apiRequest("/medicines");
            medicine = medicines.find(m => m.id === medId);
        }

        const modalHtml = `
            <div class="modal fade" id="medicineModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${medicine ? "Edit" : "Add"} Medicine</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="medicine-form">
                                <div class="mb-2">
                                    <label>Name</label>
                                    <input type="text" class="form-control" name="name" value="${medicine ? medicine.name : ""}" required>
                                </div>
                                <div class="mb-2">
                                    <label>Generic Name</label>
                                    <input type="text" class="form-control" name="generic_name" value="${medicine ? (medicine.generic_name || "") : ""}">
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-2">
                                        <label>Category</label>
                                        <select class="form-select" name="categoryId" required>
                                            ${categories.map(c => `<option value="${c.id}" ${medicine && medicine.categoryId === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-2">
                                        <label>Supplier</label>
                                        <select class="form-select" name="supplierId" required>
                                            ${suppliers.map(s => `<option value="${s.id}" ${medicine && medicine.supplierId === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-2">
                                        <label>Buying Price</label>
                                        <input type="number" step="0.01" class="form-control" name="buying_price" value="${medicine ? medicine.buying_price : ""}" required>
                                    </div>
                                    <div class="col-md-6 mb-2">
                                        <label>Selling Price</label>
                                        <input type="number" step="0.01" class="form-control" name="selling_price" value="${medicine ? medicine.selling_price : ""}" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-2">
                                        <label>Stock Quantity</label>
                                        <input type="number" class="form-control" name="stock_quantity" value="${medicine ? medicine.stock_quantity : "0"}" required>
                                    </div>
                                    <div class="col-md-6 mb-2">
                                        <label>Expiry Date</label>
                                        <input type="date" class="form-control" name="expiry_date" value="${medicine ? medicine.expiry_date : ""}" required>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label>Image</label>
                                    <input type="file" class="form-control" name="image">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="save-medicine-btn">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldModal = document.getElementById('medicineModal');
        if (oldModal) oldModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('medicineModal'));
        modal.show();

        document.getElementById('save-medicine-btn').addEventListener('click', async () => {
            const form = document.getElementById('medicine-form');
            const formData = new FormData(form);
            
            try {
                const method = medicine ? "PUT" : "POST";
                const endpoint = medicine ? `/medicines/${medicine.id}` : "/medicines";
                await apiRequest(endpoint, method, formData, true);
                modal.hide();
                await renderMedicines();
            } catch (err) {
                alert(err.message);
            }
        });
    } catch (err) {
        alert(err.message);
    }
}

async function editMedicine(id) {
    await showAddMedicineModal(id);
}

async function deleteMedicine(id) {
    if (confirm("Are you sure you want to delete this medicine?")) {
        try {
            await apiRequest(`/medicines/${id}`, "DELETE");
            await renderMedicines();
        } catch (err) {
            alert(err.message);
        }
    }
}

// Ensure all functions are global
window.loadSection = loadSection;
window.renderDashboard = renderDashboard;
window.renderMedicines = renderMedicines;
window.renderCategories = renderCategories;
window.renderSuppliers = renderSuppliers;
window.renderPurchases = renderPurchases;
window.renderSales = renderSales;
window.addPurchase = addPurchase;
window.addSale = addSale;
window.viewSaleDetails = viewSaleDetails;
window.viewPurchaseDetails = viewPurchaseDetails;
window.showCategoryModal = showCategoryModal;
window.deleteCategory = deleteCategory;
window.showSupplierModal = showSupplierModal;
window.deleteSupplier = deleteSupplier;
window.showAddMedicineModal = showAddMedicineModal;
window.editMedicine = editMedicine;
window.deleteMedicine = deleteMedicine;
