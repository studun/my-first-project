const sectionContent = document.getElementById("section-content");
const mainModalInstance = new bootstrap.Modal(document.getElementById('mainModal'));
const mainModalLabel = document.getElementById('mainModalLabel');
const mainModalBody = document.getElementById('mainModalBody');
const mainModalSaveBtn = document.getElementById('mainModalSaveBtn');

function showModal(title, bodyHtml, onSave) {
    mainModalLabel.textContent = title;
    mainModalBody.innerHTML = bodyHtml;
    const newSaveBtn = mainModalSaveBtn.cloneNode(true);
    mainModalSaveBtn.parentNode.replaceChild(newSaveBtn, mainModalSaveBtn);
    if (onSave) {
        document.getElementById('mainModalSaveBtn').style.display = 'inline-block';
        document.getElementById('mainModalSaveBtn').onclick = onSave;
    } else {
        document.getElementById('mainModalSaveBtn').style.display = 'none';
    }
    mainModalInstance.show();
}

async function renderDashboard() {
    try {
        const data = await api.get("/dashboard/stats");
        const stats = data.stats || {};
        const latestSales = Array.isArray(stats.latestSales) ? stats.latestSales : [];
        sectionContent.innerHTML = `
            <div class="row">
                <div class="col-md-3"><div class="card text-white bg-primary mb-3"><div class="card-body"><h5 class="card-title">Total Medicines</h5><p class="card-text fs-3">${stats.totalMedicines || 0}</p></div></div></div>
                <div class="col-md-3"><div class="card text-white bg-success mb-3"><div class="card-body"><h5 class="card-title">Total Sales</h5><p class="card-text fs-3">$${(stats.totalSales || 0).toFixed(2)}</p></div></div></div>
                <div class="col-md-3"><div class="card text-white bg-warning mb-3"><div class="card-body"><h5 class="card-title">Low Stock</h5><p class="card-text fs-3">${stats.lowStockCount || 0}</p></div></div></div>
                <div class="col-md-3"><div class="card text-white bg-danger mb-3"><div class="card-body"><h5 class="card-title">Expired</h5><p class="card-text fs-3">${stats.expiredCount || 0}</p></div></div></div>
            </div>
            <h3>Recent Sales</h3>
            <table class="table">
                <thead><tr><th>Date</th><th>User</th><th>Total</th></tr></thead>
                <tbody>
                    ${latestSales.map(sale => `<tr><td>${new Date(sale.createdAt).toLocaleDateString()}</td><td>${sale.user?.name || 'N/A'}</td><td>$${sale.total_amount || 0}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        sectionContent.innerHTML = `<div class="alert alert-danger">Failed to load dashboard: ${error.message}</div>`;
    }
}

async function renderMedicines() {
    try {
        const res = await api.get("/medicines");
        const medicines = Array.isArray(res.medicines) ? res.medicines : [];
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h2>Medicines</h2>
                <button class="btn btn-primary" onclick="showAddMedicineModal()">Add New Medicine</button>
            </div>
            <table class="table">
                <thead><tr><th>Name</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
                <tbody>
                    ${medicines.map(m => `
                        <tr>
                            <td>${m.name}</td>
                            <td>$${m.buying_price}</td>
                            <td>${m.stock_quantity}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick='editMedicine(${JSON.stringify(m).replace(/'/g, "&#39;")})'>Edit</button>
                                <button class="btn btn-sm btn-warning" onclick="expireMedicine(${m.id})">Mark Expired</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${m.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        sectionContent.innerHTML = `<div class="alert alert-danger">Failed to load medicines: ${error.message}</div>`;
    }
}

async function expireMedicine(id) {
    if (confirm("Mark this medicine as expired? (Stock will be set to 0)")) {
        try {
            await apiRequest(`/medicines/${id}/expire`, "PATCH");
            renderMedicines();
        } catch (error) {
            alert("Failed to mark as expired: " + (error.error || error.message));
        }
    }
}

async function deleteMedicine(id) {
    if (confirm("Are you sure you want to delete this medicine?")) {
        try {
            await api.delete(`/medicines/${id}`);
            renderMedicines();
        } catch (error) {
            alert("Failed to delete medicine: " + error.message);
        }
    }
}

function showAddMedicineModal() {
    showModal("Add Medicine", `
        <form id="medicineForm">
            <div class="mb-3"><label>Name</label><input type="text" id="medName" class="form-control" required></div>
            <div class="mb-3"><label>Price</label><input type="number" id="medPrice" class="form-control" step="0.01" required></div>
            <div class="mb-3"><label>Quantity</label><input type="number" id="medQty" class="form-control" required></div>
        </form>
    `, async () => {
        const data = {
            name: document.getElementById("medName").value,
            price: document.getElementById("medPrice").value,
            quantity: document.getElementById("medQty").value
        };
        try {
            await api.post("/medicines", data);
            bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
            renderMedicines(); // Refresh list
        } catch (error) {
            alert("Failed to add medicine: " + (error.error || error.message));
        }
    });
}

async function editMedicine(medicine) {
    showModal("Edit Medicine", `
        <form id="editMedicineForm">
            <div class="mb-3"><label>Name</label><input type="text" id="editMedName" value="${medicine.name}" class="form-control" required></div>
            <div class="mb-3"><label>Price</label><input type="number" id="editMedPrice" value="${medicine.price}" class="form-control" step="0.01" required></div>
        </form>
    `, async () => {
        const data = {
            name: document.getElementById("editMedName").value,
            price: document.getElementById("editMedPrice").value
        };
        try {
            await api.put(`/medicines/${medicine.id}`, data);
            bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
            renderMedicines();
        } catch (error) {
            alert("Failed to update medicine: " + error.message);
        }
    });
}

async function renderCategories() {
    try {
        const res = await api.get("/categories");
        const categories = Array.isArray(res) ? res : [];
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h2>Categories</h2>
                <button class="btn btn-primary" onclick="showCategoryModal()">Add Category</button>
            </div>
            <table class="table">
                <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
                <tbody>
                    ${categories.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td>${c.description || ''}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick='showCategoryModal(${JSON.stringify(c).replace(/'/g, "&#39;")})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        sectionContent.innerHTML = `<div class="alert alert-danger">Failed to load categories: ${error.message}</div>`;
    }
}

async function deleteCategory(id) {
    if (confirm("Delete this category?")) {
        try {
            await api.delete(`/categories/${id}`);
            renderCategories();
        } catch (error) {
            alert("Failed to delete category: " + error.message);
        }
    }
}

function showCategoryModal(category = {}) {
    const isEdit = !!category.id;
    showModal(isEdit ? "Edit Category" : "Add Category", `
        <form id="categoryForm">
            <div class="mb-3"><label>Name</label><input type="text" id="catName" value="${category.name || ''}" class="form-control" required></div>
            <div class="mb-3"><label>Description</label><input type="text" id="catDesc" value="${category.description || ''}" class="form-control"></div>
        </form>
    `, async () => {
        const data = {
            name: document.getElementById("catName").value,
            description: document.getElementById("catDesc").value
        };
        try {
            if (isEdit) await api.put(`/categories/${category.id}`, data);
            else await api.post("/categories", data);
            bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
            renderCategories();
        } catch (error) {
            alert("Failed to save category: " + error.message);
        }
    });
}

async function renderSuppliers() {
    try {
        const res = await api.get("/suppliers");
        const suppliers = Array.isArray(res) ? res : [];
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h2>Suppliers</h2>
                <button class="btn btn-primary" onclick="showSupplierModal()">Add Supplier</button>
            </div>
            <table class="table">
                <thead><tr><th>Name</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                    ${suppliers.map(s => `
                        <tr>
                            <td>${s.name}</td>
                            <td>${s.phone || ''}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick='showSupplierModal(${JSON.stringify(s).replace(/'/g, "&#39;")})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${s.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        sectionContent.innerHTML = `<div class="alert alert-danger">Failed to load suppliers: ${error.message}</div>`;
    }
}

async function deleteSupplier(id) {
    if (confirm("Delete this supplier?")) {
        try {
            await api.delete(`/suppliers/${id}`);
            renderSuppliers();
        } catch (error) {
            alert("Failed to delete supplier: " + error.message);
        }
    }
}

function showSupplierModal(supplier = {}) {
    const isEdit = !!supplier.id;
    showModal(isEdit ? "Edit Supplier" : "Add Supplier", `
        <form id="supplierForm">
            <div class="mb-3"><label>Name</label><input type="text" id="supName" value="${supplier.name || ''}" class="form-control" required></div>
            <div class="mb-3"><label>Phone</label><input type="text" id="supPhone" value="${supplier.phone || ''}" class="form-control"></div>
        </form>
    `, async () => {
        const data = {
            name: document.getElementById("supName").value,
            phone: document.getElementById("supPhone").value
        };
        try {
            if (isEdit) await api.put(`/suppliers/${supplier.id}`, data);
            else await api.post("/suppliers", data);
            bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
            renderSuppliers();
        } catch (error) {
            alert("Failed to save supplier: " + error.message);
        }
    });
}

async function renderPurchases() {
    try {
        const res = await api.get("/purchases");
        const purchases = Array.isArray(res.purchases) ? res.purchases : [];
        sectionContent.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h2>Purchases</h2>
                <button class="btn btn-primary" onclick="addPurchase()">Record New Purchase</button>
            </div>
            <table class="table">
                <thead><tr><th>Date</th><th>Items</th><th>Total Amount</th></tr></thead>
                <tbody>
                    ${purchases.map(p => `
                        <tr>
                            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                            <td>${(p.items || []).map(i => i.medicine?.name || 'N/A').join(', ')}</td>
                            <td>$${p.total_amount || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        sectionContent.innerHTML = `<div class="alert alert-danger">Failed to load purchases: ${error.message}</div>`;
    }
}

async function renderSales() {
    try {
        // Fetch data for lookup
        const medRes = await api.get("/medicines");
        const medicines = Array.isArray(medRes.medicines) ? medRes.medicines : [];
        const salesRes = await api.get("/sales");
        const sales = Array.isArray(salesRes.sales) ? salesRes.sales : [];

        sectionContent.innerHTML = `
            <h2>POS / Checkout</h2>
            <div class="row">
                <div class="col-md-6">
                    <div class="card p-3 mb-3">
                        <input type="text" id="sale-medicine-search" class="form-control mb-2" placeholder="Search medicine by name...">
                        <input type="number" id="sale-quantity" class="form-control mb-2" min="1" value="1">
                        <div id="medicine-details-preview" class="p-2 border rounded bg-light mb-2">Search to see details...</div>
                        <button id="submit-sale" class="btn btn-success w-100" disabled>Complete Sale</button>
                    </div>
                </div>
                <div class="col-md-6">
                    <h3>Sales Log</h3>
                    <table class="table table-sm">
                        <thead><tr><th>Date</th><th>Total</th></tr></thead>
                        <tbody>
                            ${sales.map(s => `<tr><td>${new Date(s.createdAt).toLocaleDateString()}</td><td>$${s.total_amount || 0}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Logic for search and POS
        let selectedMed = null;
        const searchInput = document.getElementById("sale-medicine-search");
        const qtyInput = document.getElementById("sale-quantity");
        const preview = document.getElementById("medicine-details-preview");
        const submitBtn = document.getElementById("submit-sale");

        searchInput.addEventListener("input", () => {
            const term = searchInput.value.trim().toLowerCase();
            if (!term) {
                preview.innerHTML = "Search to see details...";
                submitBtn.disabled = true;
                selectedMed = null;
                return;
            }
            selectedMed = medicines.find(m => m.name.toLowerCase().includes(term) || m.id.toString() === term);
            if (selectedMed) {
                const price = selectedMed.selling_price || selectedMed.buying_price || 0;
                preview.innerHTML = `
                    <strong>${selectedMed.name}</strong><br>
                    Price: $${parseFloat(price).toFixed(2)}<br>
                    In Stock: ${selectedMed.stock_quantity}
                `;
                submitBtn.disabled = false;
            } else {
                preview.innerHTML = "Medicine not found";
                submitBtn.disabled = true;
            }
        });

        submitBtn.addEventListener("click", async () => {
            if (!selectedMed) return;
            const quantity = parseInt(qtyInput.value, 10);
            if (isNaN(quantity) || quantity <= 0) {
                alert("Please enter a valid quantity");
                return;
            }
            if (quantity > selectedMed.stock_quantity) {
                alert("Insufficient stock!");
                return;
            }
            try {
                await api.post("/sales", {
                    items: [
                        {
                            medicineId: selectedMed.id,
                            quantity: quantity
                        }
                    ]
                });
                alert("Sale processed successfully");
                
                // Refresh all UI tables and reset POS form
                await Promise.all([renderSales(), renderMedicines()]);
                searchInput.value = "";
                qtyInput.value = "1";
                preview.innerHTML = "Search to see details...";
                submitBtn.disabled = true;
            } catch (err) {
                alert("Sale failed: " + (err.message || err.error));
            }
        });
    } catch (error) {
        sectionContent.innerHTML = `<div class="alert alert-danger">Failed to load POS: ${error.message}</div>`;
    }
}

async function addPurchase() {
    const medRes = await api.get("/medicines");
    const supRes = await api.get("/suppliers");
    const medicines = Array.isArray(medRes.medicines) ? medRes.medicines : [];
    const suppliers = Array.isArray(supRes) ? supRes : [];

    // Create the select options strings
    const medOptions = medicines.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    const supOptions = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    showModal("Record New Purchase", `
        <form id="purchaseForm">
            <div class="mb-3">
                <label>Medicine</label>
                <select id="purchaseMedicineId" class="form-control" required>
                    <option value="">-- Select Medicine --</option>
                    ${medOptions}
                </select>
            </div>
            <div class="mb-3">
                <label>Supplier</label>
                <select id="purchaseSupplierId" class="form-control">
                    <option value="">-- Select Supplier (Optional) --</option>
                    ${supOptions}
                </select>
            </div>
            <div class="mb-3"><label>Invoice Number</label><input type="text" id="purchInvoice" class="form-control" required></div>
            <div class="mb-3"><label>Quantity</label><input type="number" id="purchQty" class="form-control" min="1" required></div>
            <div class="mb-3"><label>Unit Price</label><input type="number" id="purchPrice" class="form-control" step="0.01" required></div>
        </form>
    `, async () => {
        const medId = document.getElementById('purchaseMedicineId').value;
        const supId = document.getElementById('purchaseSupplierId').value;
        const invoice = document.getElementById('purchInvoice').value;
        const qty = document.getElementById("purchQty").value;
        const price = document.getElementById("purchPrice").value;

        if (!medId || !qty || !price || !invoice) {
            alert("Please fill in all required fields.");
            return;
        }

        const data = {
            invoice_number: invoice,
            supplierId: supId ? Number(supId) : null,
            items: [{
                medicineId: Number(medId),
                quantity: Number(qty),
                unit_price: Number(price)
            }]
        };
        
        try {
            await api.post("/purchases", data);
            bootstrap.Modal.getInstance(document.getElementById('mainModal')).hide();
            renderPurchases();
        } catch (error) {
            console.error("Purchase Submission Error:", error);
            const errorMessage = error.response?.data?.error || error.message || "Unknown error";
            alert("Failed to record purchase: " + errorMessage);
        }
    });
}
async function addSale() { alert("Use Sales tab for logs; POS functionality requires a dedicated Checkout interface."); }
async function viewSaleDetails(id) { alert("View details for sale " + id); }
async function viewPurchaseDetails(id) { alert("View details for purchase " + id); }

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".navbar-nav").addEventListener("click", (e) => {
        if (e.target.classList.contains("nav-link")) {
            e.preventDefault();
            const section = e.target.getAttribute("data-section");
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            e.target.classList.add("active");
            loadSection(section);
        }
    });
});

async function loadSection(section) {
    if (!section) return;
    sectionContent.innerHTML = '<div id="inner-spinner" class="text-center mt-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    try {
        sectionContent.innerHTML = "";
        switch (section) {
            case "dashboard": await renderDashboard(); break;
            case "medicines": await renderMedicines(); break;
            case "categories": await renderCategories(); break;
            case "suppliers": await renderSuppliers(); break;
            case "purchases": await renderPurchases(); break;
            case "sales": await renderSales(); break;
            default: sectionContent.innerHTML = "<h2>Section not found</h2>";
        }
    } catch (err) {
        sectionContent.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}

window.loadSection = loadSection;
window.renderDashboard = renderDashboard;
window.renderMedicines = renderMedicines;
window.renderCategories = renderCategories;
window.renderSuppliers = renderSuppliers;
window.renderPurchases = renderPurchases;
window.renderSales = renderSales;
window.showCategoryModal = showCategoryModal;
window.deleteCategory = deleteCategory;
window.showSupplierModal = showSupplierModal;
window.deleteSupplier = deleteSupplier;
window.showAddMedicineModal = showAddMedicineModal;
window.editMedicine = editMedicine;
window.deleteMedicine = deleteMedicine;
window.addPurchase = addPurchase;
window.addSale = addSale;
window.viewSaleDetails = viewSaleDetails;
window.viewPurchaseDetails = viewPurchaseDetails;
