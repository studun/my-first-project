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
                <h2>فواتير المشتريات</h2>
                <button class="btn btn-primary" onclick="addPurchase()">
                    <i class="bi bi-plus-circle me-2"></i>شراء جديد
                </button>
            </div>
            <div class="card shadow p-4">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>تاريخ الإنشاء</th>
                            <th>المورد</th>
                            <th>رقم الفاتورة</th>
                            <th>الإجمالي</th>
                            <th>عناصر الفاتورة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchases.map(p => `
                            <tr>
                                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                                <td><span class="badge bg-info text-dark">${p.supplier ? p.supplier.name : "N/A"}</span></td>
                                <td><code>${p.invoice_number || "-"}</code></td>
                                <td class="fw-bold">$${p.total_amount}</td>
                                <td>${p.items ? p.items.length : 0} أصناف</td>
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
                            <h5 class="modal-title"><i class="bi bi-cart-plus me-2"></i>إنشاء فاتورة مشتريات جديدة</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="purchase-form">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">المورد</label>
                                        <select class="form-select" id="purchase-supplier" required>
                                            <option value="">اختر المورد</option>
                                            ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">رقم الفاتورة</label>
                                        <input type="text" class="form-control" id="purchase-invoice" placeholder="مثلاً: INV-1001" required>
                                    </div>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="mb-0"><i class="bi bi-list-ul me-2"></i>عناصر الفاتورة</h5>
                                    <button type="button" class="btn btn-success btn-sm" id="add-item-btn">
                                        <i class="bi bi-plus-lg"></i> إضافة عنصر
                                    </button>
                                </div>
                                <div id="purchase-items-container">
                                    <div class="row g-2 mb-2 purchase-item-row">
                                        <div class="col-md-5">
                                            <label class="small text-muted">اسم الدواء/المنتج</label>
                                            <select class="form-select medicine-select" required>
                                                <option value="">اختر الدواء/المنتج</option>
                                                ${medicines.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="small text-muted">الكمية</label>
                                            <input type="number" class="form-control qty-input" placeholder="الكمية" min="1" required>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="small text-muted">سعر الوحدة</label>
                                            <input type="number" step="0.01" class="form-control price-input" placeholder="سعر الوحدة" min="0" required>
                                        </div>
                                        <div class="col-md-1 d-flex align-items-end">
                                            <button type="button" class="btn btn-outline-danger btn-sm remove-item mb-1">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary px-4" id="save-purchase-btn">حفظ الفاتورة</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const oldModal = document.getElementById('purchaseModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('purchaseModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        const container = document.getElementById('purchase-items-container');

        // Function to handle row removal
        const setupRemoveEvent = (row) => {
            row.querySelector('.remove-item').addEventListener('click', () => {
                if (container.querySelectorAll('.purchase-item-row').length > 1) {
                    row.remove();
                } else {
                    alert("يجب أن تحتوي الفاتورة على عنصر واحد على الأقل.");
                }
            });
        };

        // Setup first row
        setupRemoveEvent(container.querySelector('.purchase-item-row'));

        // Add item row event
        document.getElementById('add-item-btn').addEventListener('click', () => {
            const firstRow = container.querySelector('.purchase-item-row');
            const newRow = firstRow.cloneNode(true);
            
            // Clear values
            newRow.querySelectorAll('input').forEach(i => i.value = '');
            newRow.querySelector('select').value = '';
            
            container.appendChild(newRow);
            setupRemoveEvent(newRow);
        });

        // Save purchase event
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
                alert("يرجى ملء جميع الحقول بشكل صحيح.");
                return;
            }

            try {
                const btn = document.getElementById('save-purchase-btn');
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> جاري الحفظ...';
                
                await apiRequest("/purchases", "POST", { supplierId, invoice_number, items });
                modal.hide();
                await renderPurchases();
            } catch (err) {
                alert(err.message);
                const btn = document.getElementById('save-purchase-btn');
                btn.disabled = false;
                btn.innerHTML = 'حفظ الفاتورة';
            }
        });

    } catch (err) {
        alert("فشل في تحميل بيانات المشتريات: " + err.message);
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
