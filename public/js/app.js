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
                                <td>${sale.items.length} items</td>
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

// Placeholder for other sections to keep it concise for now
async function renderCategories() {
     try {
        const categories = await apiRequest("/categories");
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <button class="btn btn-primary" onclick="addCategory()">Add Category</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(cat => `
                            <tr>
                                <td>${cat.id}</td>
                                <td>${cat.name}</td>
                                <td>${cat.description || "-"}</td>
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
                <button class="btn btn-primary" onclick="addSupplier()">Add Supplier</button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.map(sup => `
                            <tr>
                                <td>${sup.name}</td>
                                <td>${sup.phone}</td>
                                <td>${sup.email || "-"}</td>
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
                        </tr>
                    </thead>
                    <tbody>
                        ${purchases.map(p => `
                            <tr>
                                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                                <td>${p.supplier ? p.supplier.name : "N/A"}</td>
                                <td>${p.invoice_number || "-"}</td>
                                <td>$${p.total_amount}</td>
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
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.map(s => `
                            <tr>
                                <td>${new Date(s.createdAt).toLocaleDateString()}</td>
                                <td>${s.customer_name || "Guest"}</td>
                                <td>$${s.total_amount}</td>
                                <td>${s.payment_type}</td>
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
