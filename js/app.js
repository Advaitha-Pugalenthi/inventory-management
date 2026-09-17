/**
 * Inventory Control - frontend application logic.
 *
 * Automatically connects to the Spring Boot REST API when online,
 * or operates in LocalStorage Demo Mode when offline.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const PRODUCTS_URL = `${API_BASE_URL}/products/`;

// Initial sample data for standalone demo mode
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    product_name: 'Wireless Optical Mouse',
    category: 'Electronics',
    quantity: 45,
    price: '29.99',
    supplier: 'Logitech',
    stock_status: 'In Stock',
    created_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_date: new Date().toISOString()
  },
  {
    id: 2,
    product_name: 'Ergonomic Office Chair',
    category: 'Furniture',
    quantity: 5,
    price: '199.99',
    supplier: 'Herman Miller',
    stock_status: 'Low Stock',
    created_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_date: new Date().toISOString()
  },
  {
    id: 3,
    product_name: 'Mechanical Keyboard',
    category: 'Electronics',
    quantity: 0,
    price: '89.50',
    supplier: 'Keychron',
    stock_status: 'Out of Stock',
    created_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_date: new Date().toISOString()
  },
  {
    id: 4,
    product_name: 'Stainless Steel Water Bottle',
    category: 'Other',
    quantity: 120,
    price: '15.00',
    supplier: 'HydroFlask',
    stock_status: 'In Stock',
    created_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_date: new Date().toISOString()
  }
];

// State
let allProducts = [];
let currentSort = { field: 'created_date', direction: 'desc' };
let isLocalDemoMode = false;

// DOM references
const apiStatusEl = document.getElementById('apiStatus');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');

const tableBody = document.getElementById('productTableBody');
const tableEmptyState = document.getElementById('tableEmptyState');
const tableLoadingState = document.getElementById('tableLoadingState');

const statTotal = document.getElementById('statTotal');
const statInStock = document.getElementById('statInStock');
const statLowStock = document.getElementById('statLowStock');
const statOutStock = document.getElementById('statOutStock');
const statValue = document.getElementById('statValue');

const modalOverlay = document.getElementById('productModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const productForm = document.getElementById('productForm');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const submitBtn = document.getElementById('submitBtn');
const formBanner = document.getElementById('formBanner');

const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const categoryInput = document.getElementById('category');
const supplierInput = document.getElementById('supplier');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const toastContainer = document.getElementById('toastContainer');

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Food & Beverages',
  'Stationery',
  'Tools & Hardware',
  'Other',
];

// Init
document.addEventListener('DOMContentLoaded', () => {
  populateCategoryDropdowns();
  attachEventListeners();
  fetchProducts();
});

function populateCategoryDropdowns() {
  categoryFilter.innerHTML = '<option value="">All categories</option>';
  categoryInput.innerHTML = '<option value="">Select category</option>';
  
  CATEGORIES.forEach((cat) => {
    const filterOpt = document.createElement('option');
    filterOpt.value = cat;
    filterOpt.textContent = cat;
    categoryFilter.appendChild(filterOpt);

    const formOpt = document.createElement('option');
    formOpt.value = cat;
    formOpt.textContent = cat;
    categoryInput.appendChild(formOpt);
  });
}

function attachEventListeners() {
  searchInput.addEventListener('input', debounce(renderTable, 250));
  categoryFilter.addEventListener('change', renderTable);
  statusFilter.addEventListener('change', renderTable);

  openAddModalBtn.addEventListener('click', () => openModal('add'));
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  productForm.addEventListener('submit', handleFormSubmit);

  document.querySelectorAll('.data-table thead th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort = { field, direction: 'asc' };
      }
      renderTable();
    });
  });
}

// LocalStorage Helper
function computeStockStatus(qty) {
  const q = Number(qty);
  if (q === 0) return 'Out of Stock';
  if (q <= 10) return 'Low Stock';
  return 'In Stock';
}

function getStoredProducts() {
  const data = localStorage.getItem('inventory_products');
  if (!data) {
    localStorage.setItem('inventory_products', JSON.stringify(SAMPLE_PRODUCTS));
    return SAMPLE_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch (_) {
    return SAMPLE_PRODUCTS;
  }
}

function saveStoredProducts(products) {
  localStorage.setItem('inventory_products', JSON.stringify(products));
}

// API and Local Calls
async function fetchProducts() {
  showLoading(true);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(PRODUCTS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Server status ${response.status}`);
    const data = await response.json();

    allProducts = Array.isArray(data) ? data : (data.results || []);
    isLocalDemoMode = false;
    setApiStatus(true, 'API connected');
  } catch (err) {
    isLocalDemoMode = true;
    allProducts = getStoredProducts();
    setApiStatus(true, 'Demo Mode (Local Data)');
  } finally {
    renderTable();
    renderStats();
    showLoading(false);
  }
}

async function createProduct(payload) {
  if (isLocalDemoMode) {
    const products = getStoredProducts();
    const newId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id))) + 1 : 1;
    const newProduct = {
      id: newId,
      ...payload,
      stock_status: computeStockStatus(payload.quantity),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    products.unshift(newProduct);
    saveStoredProducts(products);
    return { ok: true, data: { success: true, message: 'Product created successfully.', data: newProduct } };
  }

  try {
    const response = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (err) {
    isLocalDemoMode = true;
    return createProduct(payload);
  }
}

async function updateProduct(id, payload) {
  if (isLocalDemoMode) {
    let products = getStoredProducts();
    const numId = Number(id);
    let updatedObj = null;
    products = products.map((p) => {
      if (Number(p.id) === numId) {
        updatedObj = {
          ...p,
          ...payload,
          stock_status: computeStockStatus(payload.quantity !== undefined ? payload.quantity : p.quantity),
          updated_date: new Date().toISOString(),
        };
        return updatedObj;
      }
      return p;
    });
    saveStoredProducts(products);
    return { ok: true, data: { success: true, message: 'Product updated successfully.', data: updatedObj } };
  }

  try {
    const response = await fetch(`${PRODUCTS_URL}${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  } catch (err) {
    isLocalDemoMode = true;
    return updateProduct(id, payload);
  }
}

async function deleteProduct(id) {
  if (isLocalDemoMode) {
    let products = getStoredProducts();
    const numId = Number(id);
    const target = products.find((p) => Number(p.id) === numId);
    products = products.filter((p) => Number(p.id) !== numId);
    saveStoredProducts(products);
    const name = target ? target.product_name : 'Product';
    return { ok: true, data: { success: true, message: `Product "${name}" deleted successfully.` } };
  }

  try {
    const response = await fetch(`${PRODUCTS_URL}${id}/`, { method: 'DELETE' });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    return { ok: response.ok, data };
  } catch (err) {
    isLocalDemoMode = true;
    return deleteProduct(id);
  }
}

function setApiStatus(isOnline, statusText) {
  apiStatusEl.classList.remove('status-pill--pending', 'status-pill--ok', 'status-pill--error');
  if (isOnline) {
    apiStatusEl.classList.add('status-pill--ok');
    apiStatusEl.textContent = statusText || 'API connected';
  } else {
    apiStatusEl.classList.add('status-pill--error');
    apiStatusEl.textContent = 'API offline';
  }
}

// Rendering
function getFilteredProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const status = statusFilter.value;

  let filtered = allProducts.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.product_name.toLowerCase().includes(searchTerm) ||
      p.supplier.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || p.category === category;
    const matchesStatus = !status || p.stock_status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  filtered.sort((a, b) => {
    let valA = a[currentSort.field];
    let valB = b[currentSort.field];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
    if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
}

function renderTable() {
  const filtered = getFilteredProducts();
  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    tableEmptyState.hidden = false;
  } else {
    tableEmptyState.hidden = true;
    filtered.forEach((product) => tableBody.appendChild(buildRow(product)));
  }
}

function buildRow(product) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="cell-muted">#${product.id}</td>
    <td class="cell-name">${escapeHtml(product.product_name)}</td>
    <td>${escapeHtml(product.category)}</td>
    <td>${product.quantity}</td>
    <td>$${Number(product.price).toFixed(2)}</td>
    <td>${escapeHtml(product.supplier)}</td>
    <td>${buildStatusBadge(product.stock_status)}</td>
    <td class="cell-muted">${formatDate(product.created_date)}</td>
    <td class="col-actions">
      <button class="btn--edit-text" data-action="edit" data-id="${product.id}">Edit</button>
      <button class="btn--danger-text" data-action="delete" data-id="${product.id}">Delete</button>
    </td>
  `;

  tr.querySelector('[data-action="edit"]').addEventListener('click', () => openModal('edit', product));
  tr.querySelector('[data-action="delete"]').addEventListener('click', () => handleDelete(product));

  return tr;
}

function buildStatusBadge(status) {
  const classMap = {
    'In Stock': 'badge--in-stock',
    'Low Stock': 'badge--low-stock',
    'Out of Stock': 'badge--out-of-stock',
  };
  const cls = classMap[status] || 'badge--in-stock';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function renderStats() {
  const total = allProducts.length;
  const inStock = allProducts.filter((p) => p.stock_status === 'In Stock').length;
  const lowStock = allProducts.filter((p) => p.stock_status === 'Low Stock').length;
  const outStock = allProducts.filter((p) => p.stock_status === 'Out of Stock').length;
  const totalValue = allProducts.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );

  statTotal.textContent = total;
  statInStock.textContent = inStock;
  statLowStock.textContent = lowStock;
  statOutStock.textContent = outStock;
  statValue.textContent = `$${totalValue.toFixed(2)}`;
}

function showLoading(isLoading) {
  tableLoadingState.hidden = !isLoading;
  if (isLoading) tableEmptyState.hidden = true;
}

// Modal (Add / Edit)
function openModal(mode, product = null) {
  clearFormErrors();
  productForm.reset();

  if (mode === 'edit' && product) {
    modalTitle.textContent = 'Edit product';
    submitBtn.textContent = 'Save changes';
    productIdInput.value = product.id;
    productNameInput.value = product.product_name;
    categoryInput.value = product.category;
    supplierInput.value = product.supplier;
    quantityInput.value = product.quantity;
    priceInput.value = product.price;
  } else {
    modalTitle.textContent = 'Add product';
    submitBtn.textContent = 'Save product';
    productIdInput.value = '';
  }

  modalOverlay.hidden = false;
  productNameInput.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
}

// Form validation & submit
function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  formBanner.hidden = true;
  formBanner.textContent = '';
}

function setFieldError(fieldId, message) {
  const errorEl = document.getElementById(`err-${fieldId}`);
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add('invalid');
}

function validateForm() {
  clearFormErrors();
  let isValid = true;

  const name = productNameInput.value.trim();
  if (!name) {
    setFieldError('productName', 'Product name is required.');
    isValid = false;
  } else if (name.length < 2) {
    setFieldError('productName', 'Must be at least 2 characters.');
    isValid = false;
  }

  if (!categoryInput.value) {
    setFieldError('category', 'Please select a category.');
    isValid = false;
  }

  const supplier = supplierInput.value.trim();
  if (!supplier) {
    setFieldError('supplier', 'Supplier is required.');
    isValid = false;
  }

  const quantity = quantityInput.value;
  if (quantity === '' || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
    setFieldError('quantity', 'Enter a whole number of 0 or more.');
    isValid = false;
  }

  const price = priceInput.value;
  if (price === '' || Number(price) < 0) {
    setFieldError('price', 'Enter a price of 0 or more.');
    isValid = false;
  }

  return isValid;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const payload = {
    product_name: productNameInput.value.trim(),
    category: categoryInput.value,
    supplier: supplierInput.value.trim(),
    quantity: parseInt(quantityInput.value, 10),
    price: parseFloat(priceInput.value).toFixed(2),
  };

  const id = productIdInput.value;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    const { ok, data } = id
      ? await updateProduct(id, payload)
      : await createProduct(payload);

    if (!ok) {
      applyServerErrors(data.errors || {});
      formBanner.hidden = false;
      formBanner.textContent = 'Please fix the highlighted fields and try again.';
      return;
    }

    showToast((data && data.message) || 'Saved successfully.', 'success');
    closeModal();
    await fetchProducts();
  } catch (err) {
    console.error(err);
    formBanner.hidden = false;
    formBanner.textContent = 'An error occurred while saving. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = id ? 'Save changes' : 'Save product';
  }
}

function applyServerErrors(errors) {
  const fieldMap = {
    product_name: 'productName',
    category: 'category',
    supplier: 'supplier',
    quantity: 'quantity',
    price: 'price',
  };
  Object.entries(errors).forEach(([field, messages]) => {
    const fieldId = fieldMap[field];
    if (fieldId) {
      setFieldError(fieldId, Array.isArray(messages) ? messages[0] : messages);
    }
  });
}

async function handleDelete(product) {
  const confirmed = window.confirm(
    `Delete "${product.product_name}"? This action cannot be undone.`
  );
  if (!confirmed) return;

  try {
    const { ok, data } = await deleteProduct(product.id);
    if (!ok) {
      showToast((data && data.message) || 'Could not delete this product.', 'error');
      return;
    }
    showToast((data && data.message) || 'Product deleted.', 'success');
    await fetchProducts();
  } catch (err) {
    console.error(err);
    showToast('Could not delete product. Please try again.', 'error');
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
