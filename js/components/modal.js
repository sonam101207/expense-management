/**
 * SpendWise — Modal Dialogs Controller
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Modal = {
  containerId: 'spendwise-modal-container',

  getContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      document.body.appendChild(container);
    }
    return container;
  },

  close() {
    const container = this.getContainer();
    container.innerHTML = '';
  },

  // ================= 1. TRANSACTION CREATE / EDIT MODAL =================
  openTransactionModal(txId = null) {
    const isEdit = Boolean(txId);
    const tx = isEdit ? SpendWise.State.transactions.find(t => t.id === txId) : null;
    const currency = SpendWise.Config.CURRENCIES.find(c => c.code === SpendWise.State.settings.currency) || SpendWise.Config.CURRENCIES[0];

    const currentType = tx ? tx.type : 'expense';
    const categories = SpendWise.State.categories;

    const todayStr = new Date().toISOString().split('T')[0];
    const initialDate = tx ? tx.date : todayStr;

    const html = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" id="tx-modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">${isEdit ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <p class="text-xs text-slate-500">${isEdit ? 'Update transaction details and saved values' : 'Record a new income or expense entry'}</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" onclick="SpendWise.Modal.close()">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Body Form -->
          <form id="tx-form" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <!-- Type Selector (Segmented) -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Transaction Type</label>
              <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button type="button" id="btn-type-expense" class="py-2 text-xs font-medium rounded-lg transition-all ${currentType === 'expense' ? 'bg-white text-rose-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}">
                  Expense
                </button>
                <button type="button" id="btn-type-income" class="py-2 text-xs font-medium rounded-lg transition-all ${currentType === 'income' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}">
                  Income
                </button>
              </div>
              <input type="hidden" id="tx-type" value="${currentType}">
            </div>

            <!-- Title & Merchant -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Title / Description <span class="text-rose-500">*</span></label>
                <input type="text" id="tx-title" required class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Whole Foods Groceries" value="${tx ? SpendWise.Utils.sanitizeHTML(tx.title) : ''}">
                <span id="err-title" class="text-xs text-rose-500 hidden">Please enter a title</span>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Merchant / Source</label>
                <input type="text" id="tx-merchant" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Whole Foods, Employer" value="${tx ? SpendWise.Utils.sanitizeHTML(tx.merchant || '') : ''}">
              </div>
            </div>

            <!-- Amount & Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Amount (${currency.symbol}) <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">${currency.symbol}</span>
                  <input type="number" id="tx-amount" step="0.01" min="0.01" required class="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus font-medium" placeholder="0.00" value="${tx ? tx.amount : ''}">
                </div>
                <span id="err-amount" class="text-xs text-rose-500 hidden">Amount must be greater than 0</span>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-slate-600">Date <span class="text-rose-500">*</span></label>
                  <div class="space-x-1">
                    <button type="button" class="text-[11px] text-emerald-700 hover:underline" id="btn-quick-today">Today</button>
                    <span class="text-slate-300">|</span>
                    <button type="button" class="text-[11px] text-slate-500 hover:underline" id="btn-quick-yesterday">Yesterday</button>
                  </div>
                </div>
                <input type="date" id="tx-date" required class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" value="${initialDate}">
              </div>
            </div>

            <!-- Category & Subcategory -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Category <span class="text-rose-500">*</span></label>
                <select id="tx-category" required class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                  <!-- Populated dynamically based on type -->
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Subcategory</label>
                <input type="text" id="tx-subcategory" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Groceries, Coffee" value="${tx ? SpendWise.Utils.sanitizeHTML(tx.subcategory || '') : ''}">
              </div>
            </div>

            <!-- Payment Method & Recurring -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                <select id="tx-payment" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                  ${SpendWise.Config.PAYMENT_METHODS.map(p => `
                    <option value="${p.id}" ${tx && tx.paymentMethod === p.id ? 'selected' : ''}>${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div class="flex items-center pt-5">
                <label class="relative flex items-center cursor-pointer select-none">
                  <input type="checkbox" id="tx-recurring" class="sr-only peer" ${tx && tx.isRecurring ? 'checked' : ''}>
                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span class="ml-2.5 text-xs font-medium text-slate-700">Recurring Payment</span>
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <textarea id="tx-notes" rows="2" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus resize-none" placeholder="Add receipt details, order numbers, or context...">${tx ? SpendWise.Utils.sanitizeHTML(tx.notes || '') : ''}</textarea>
            </div>

            <!-- Footer Actions -->
            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors" onclick="SpendWise.Modal.close()">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 shadow-sm rounded-xl transition-all">
                ${isEdit ? 'Save Changes' : 'Record Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const container = this.getContainer();
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Populate category dropdown based on current type
    const catSelect = document.getElementById('tx-category');
    const updateCategoryOptions = (type, selectedCatId = null) => {
      const filtered = categories.filter(c => c.type === type);
      catSelect.innerHTML = filtered.map(c => `
        <option value="${c.id}" ${(selectedCatId && selectedCatId === c.id) || (!selectedCatId && filtered[0]?.id === c.id) ? 'selected' : ''}>
          ${c.name}
        </option>
      `).join('');
    };

    updateCategoryOptions(currentType, tx ? tx.categoryId : null);

    // Toggle Type Buttons
    const btnExpense = document.getElementById('btn-type-expense');
    const btnIncome = document.getElementById('btn-type-income');
    const inputType = document.getElementById('tx-type');

    btnExpense.addEventListener('click', () => {
      inputType.value = 'expense';
      btnExpense.className = 'py-2 text-xs font-semibold rounded-lg bg-white text-rose-700 shadow-sm transition-all';
      btnIncome.className = 'py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all';
      updateCategoryOptions('expense');
    });

    btnIncome.addEventListener('click', () => {
      inputType.value = 'income';
      btnIncome.className = 'py-2 text-xs font-semibold rounded-lg bg-white text-emerald-700 shadow-sm transition-all';
      btnExpense.className = 'py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all';
      updateCategoryOptions('income');
    });

    // Quick Date buttons
    document.getElementById('btn-quick-today').addEventListener('click', () => {
      document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
    });

    document.getElementById('btn-quick-yesterday').addEventListener('click', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      document.getElementById('tx-date').value = yesterday.toISOString().split('T')[0];
    });

    // Close on backdrop click
    document.getElementById('tx-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'tx-modal-overlay') SpendWise.Modal.close();
    });

    // Form Submit & Validation
    document.getElementById('tx-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('tx-title').value.trim();
      const amountVal = parseFloat(document.getElementById('tx-amount').value);
      const date = document.getElementById('tx-date').value;
      const categoryId = document.getElementById('tx-category').value;
      const type = document.getElementById('tx-type').value;
      const merchant = document.getElementById('tx-merchant').value.trim();
      const subcategory = document.getElementById('tx-subcategory').value.trim();
      const paymentMethod = document.getElementById('tx-payment').value;
      const isRecurring = document.getElementById('tx-recurring').checked;
      const notes = document.getElementById('tx-notes').value.trim();

      let hasError = false;

      if (!title) {
        document.getElementById('err-title').classList.remove('hidden');
        hasError = true;
      } else {
        document.getElementById('err-title').classList.add('hidden');
      }

      if (isNaN(amountVal) || amountVal <= 0) {
        document.getElementById('err-amount').classList.remove('hidden');
        hasError = true;
      } else {
        document.getElementById('err-amount').classList.add('hidden');
      }

      if (hasError) return;

      if (isEdit) {
        SpendWise.State.updateTransaction(txId, {
          title,
          amount: amountVal,
          type,
          categoryId,
          subcategory,
          date,
          paymentMethod,
          merchant,
          isRecurring,
          notes
        });
        SpendWise.Toast.success('Transaction updated successfully');
      } else {
        SpendWise.State.addTransaction({
          title,
          amount: amountVal,
          type,
          categoryId,
          subcategory,
          date,
          paymentMethod,
          merchant,
          isRecurring,
          notes
        });
        SpendWise.Toast.success('Transaction recorded successfully');
      }

      SpendWise.Modal.close();
    });
  },

  // ================= 2. CONFIRM DELETION MODAL =================
  confirmDelete(title, message, onConfirm) {
    const html = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" id="delete-modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <div class="p-6">
            <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-800">${SpendWise.Utils.sanitizeHTML(title)}</h3>
            <p class="text-sm text-slate-500 mt-2 leading-relaxed">${SpendWise.Utils.sanitizeHTML(message)}</p>

            <div class="flex items-center justify-end space-x-3 mt-6">
              <button type="button" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors" onclick="SpendWise.Modal.close()">
                Cancel
              </button>
              <button type="button" id="btn-confirm-delete" class="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-sm rounded-xl transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const container = this.getContainer();
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-confirm-delete').addEventListener('click', () => {
      SpendWise.Modal.close();
      if (typeof onConfirm === 'function') onConfirm();
    });

    document.getElementById('delete-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal-overlay') SpendWise.Modal.close();
    });
  },

  // ================= 3. CATEGORY CREATE / EDIT MODAL =================
  openCategoryModal(catId = null) {
    const isEdit = Boolean(catId);
    const cat = isEdit ? SpendWise.State.categories.find(c => c.id === catId) : null;
    const currency = SpendWise.Config.CURRENCIES.find(c => c.code === SpendWise.State.settings.currency) || SpendWise.Config.CURRENCIES[0];

    const icons = SpendWise.Config.AVAILABLE_ICONS;
    const colors = SpendWise.Config.PALETTE_COLORS;
    const initialIcon = cat ? cat.icon : 'tag';
    const initialColor = cat ? cat.color : '#10B981';

    const html = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" id="cat-modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">${isEdit ? 'Edit Category' : 'Create Custom Category'}</h3>
              <p class="text-xs text-slate-500">Configure name, monthly budget, icon & color</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" onclick="SpendWise.Modal.close()">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="cat-form" class="p-6 space-y-4">
            <!-- Name & Type -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Category Name <span class="text-rose-500">*</span></label>
                <input type="text" id="cat-name" required class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Pet Care, Gardening" value="${cat ? SpendWise.Utils.sanitizeHTML(cat.name) : ''}">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                <select id="cat-type" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" ${isEdit ? 'disabled' : ''}>
                  <option value="expense" ${cat && cat.type === 'expense' ? 'selected' : ''}>Expense</option>
                  <option value="income" ${cat && cat.type === 'income' ? 'selected' : ''}>Income</option>
                </select>
              </div>
            </div>

            <!-- Monthly Budget Limit -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Monthly Budget Target (${currency.symbol})</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">${currency.symbol}</span>
                <input type="number" id="cat-budget" min="0" step="10" class="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="0" value="${cat ? cat.budget || 0 : '0'}">
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Set 0 if this category does not have a strict monthly limit.</p>
            </div>

            <!-- Icon Picker -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Choose Icon</label>
              <div class="grid grid-cols-8 gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl max-h-28 overflow-y-auto" id="icon-picker-grid">
                ${icons.map(icon => `
                  <button type="button" data-icon="${icon}" class="icon-choice p-2 rounded-lg flex items-center justify-center transition-all ${icon === initialIcon ? 'bg-white shadow text-emerald-700 ring-2 ring-emerald-500' : 'text-slate-600 hover:bg-slate-200/60'}">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="cat-selected-icon" value="${initialIcon}">
            </div>

            <!-- Color Picker -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Accent Color</label>
              <div class="flex flex-wrap gap-2 items-center">
                ${colors.map(color => `
                  <button type="button" data-color="${color}" class="color-choice w-6 h-6 rounded-full transition-transform hover:scale-110 ${color === initialColor ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''}" style="background-color: ${color};"></button>
                `).join('')}
                <input type="color" id="cat-color-custom" value="${initialColor}" class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 ml-1">
              </div>
              <input type="hidden" id="cat-selected-color" value="${initialColor}">
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors" onclick="SpendWise.Modal.close()">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 shadow-sm rounded-xl transition-all">
                ${isEdit ? 'Save Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const container = this.getContainer();
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Icon select click
    document.querySelectorAll('.icon-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.icon-choice').forEach(b => {
          b.className = 'icon-choice p-2 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200/60 transition-all';
        });
        btn.className = 'icon-choice p-2 rounded-lg flex items-center justify-center bg-white shadow text-emerald-700 ring-2 ring-emerald-500 transition-all';
        document.getElementById('cat-selected-icon').value = btn.dataset.icon;
      });
    });

    // Color select click
    document.querySelectorAll('.color-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-800', 'scale-110'));
        btn.classList.add('ring-2', 'ring-offset-2', 'ring-slate-800', 'scale-110');
        document.getElementById('cat-selected-color').value = btn.dataset.color;
      });
    });

    document.getElementById('cat-color-custom').addEventListener('input', (e) => {
      document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-800', 'scale-110'));
      document.getElementById('cat-selected-color').value = e.target.value;
    });

    // Submit handler
    document.getElementById('cat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cat-name').value.trim();
      const type = document.getElementById('cat-type').value;
      const budget = parseFloat(document.getElementById('cat-budget').value) || 0;
      const icon = document.getElementById('cat-selected-icon').value;
      const color = document.getElementById('cat-selected-color').value;

      if (!name) return;

      if (isEdit) {
        SpendWise.State.updateCategory(catId, { name, budget, icon, color });
        SpendWise.Toast.success(`Category "${name}" updated`);
      } else {
        SpendWise.State.addCategory({ name, type, budget, icon, color });
        SpendWise.Toast.success(`Category "${name}" created`);
      }

      SpendWise.Modal.close();
    });

    document.getElementById('cat-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'cat-modal-overlay') SpendWise.Modal.close();
    });
  },

  // ================= 4. RECURRING RULE MODAL =================
  openRecurringModal(ruleId = null) {
    const isEdit = Boolean(ruleId);
    const rule = isEdit ? SpendWise.State.recurring.find(r => r.id === ruleId) : null;
    const currency = SpendWise.Config.CURRENCIES.find(c => c.code === SpendWise.State.settings.currency) || SpendWise.Config.CURRENCIES[0];
    const categories = SpendWise.State.categories.filter(c => c.type === (rule ? rule.type : 'expense'));

    const todayStr = new Date().toISOString().split('T')[0];

    const html = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" id="rec-modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">${isEdit ? 'Edit Recurring Schedule' : 'New Recurring Payment / Bill'}</h3>
              <p class="text-xs text-slate-500">Track repeating subscriptions, bills, or salary deposits</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" onclick="SpendWise.Modal.close()">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="rec-form" class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Title <span class="text-rose-500">*</span></label>
                <input type="text" id="rec-title" required class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Netflix 4K, Gym" value="${rule ? SpendWise.Utils.sanitizeHTML(rule.title) : ''}">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Merchant / Biller</label>
                <input type="text" id="rec-merchant" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Netflix, Landlord" value="${rule ? SpendWise.Utils.sanitizeHTML(rule.merchant || '') : ''}">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Amount (${currency.symbol}) <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">${currency.symbol}</span>
                  <input type="number" id="rec-amount" step="0.01" min="0.01" required class="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus font-medium" placeholder="0.00" value="${rule ? rule.amount : ''}">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
                <select id="rec-frequency" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                  ${SpendWise.Config.RECURRING_FREQUENCIES.map(f => `
                    <option value="${f.id}" ${rule && rule.frequency === f.id ? 'selected' : ''}>${f.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select id="rec-category" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                  ${categories.map(c => `
                    <option value="${c.id}" ${rule && rule.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Next Due Date <span class="text-rose-500">*</span></label>
                <input type="date" id="rec-next-due" required class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" value="${rule ? rule.nextDueDate : todayStr}">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                <select id="rec-payment" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                  ${SpendWise.Config.PAYMENT_METHODS.map(p => `
                    <option value="${p.id}" ${rule && rule.paymentMethod === p.id ? 'selected' : ''}>${p.name}</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Subcategory</label>
                <input type="text" id="rec-subcategory" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus" placeholder="e.g. Streaming" value="${rule ? SpendWise.Utils.sanitizeHTML(rule.subcategory || '') : ''}">
              </div>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors" onclick="SpendWise.Modal.close()">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 shadow-sm rounded-xl transition-all">
                ${isEdit ? 'Save Schedule' : 'Add Recurring Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const container = this.getContainer();
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    document.getElementById('rec-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('rec-title').value.trim();
      const amount = parseFloat(document.getElementById('rec-amount').value);
      const categoryId = document.getElementById('rec-category').value;
      const frequency = document.getElementById('rec-frequency').value;
      const nextDueDate = document.getElementById('rec-next-due').value;
      const merchant = document.getElementById('rec-merchant').value.trim();
      const paymentMethod = document.getElementById('rec-payment').value;
      const subcategory = document.getElementById('rec-subcategory').value.trim();

      if (!title || isNaN(amount) || amount <= 0 || !nextDueDate) return;

      if (isEdit) {
        SpendWise.State.updateRecurringRule(ruleId, {
          title, amount, categoryId, frequency, nextDueDate, merchant, paymentMethod, subcategory
        });
        SpendWise.Toast.success('Recurring schedule updated');
      } else {
        SpendWise.State.addRecurringRule({
          title, amount, type: 'expense', categoryId, frequency, nextDueDate, merchant, paymentMethod, subcategory
        });
        SpendWise.Toast.success('Recurring rule added');
      }

      SpendWise.Modal.close();
    });

    document.getElementById('rec-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'rec-modal-overlay') SpendWise.Modal.close();
    });
  },

  // ================= 5. CSV IMPORT MODAL =================
  openCSVImportModal() {
    const html = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" id="csv-modal-overlay">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">Import Transactions CSV</h3>
              <p class="text-xs text-slate-500">Upload a CSV file or paste raw CSV text</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" onclick="SpendWise.Modal.close()">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- File Drop / Select -->
            <div class="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50" id="csv-drop-zone">
              <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-emerald-600 mb-2"></i>
              <p class="text-xs font-semibold text-slate-700">Click to upload CSV or drag and drop</p>
              <p class="text-[11px] text-slate-400 mt-1">Expected columns: Date, Type, Title, Amount, Category, Merchant</p>
              <input type="file" id="csv-file-input" accept=".csv,text/csv" class="hidden">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Or Paste CSV Text</label>
              <textarea id="csv-raw-text" rows="5" class="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl form-input-focus resize-none" placeholder="Date,Type,Title,Amount,Category,Merchant&#10;2026-10-25,expense,Target Store,45.20,Shopping,Target"></textarea>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button type="button" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors" onclick="SpendWise.Modal.close()">
                Cancel
              </button>
              <button type="button" id="btn-process-csv" class="px-5 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 shadow-sm rounded-xl transition-all">
                Import Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const container = this.getContainer();
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    const dropZone = document.getElementById('csv-drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    const rawText = document.getElementById('csv-raw-text');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          rawText.value = evt.target.result;
        };
        reader.readAsText(file);
      }
    });

    document.getElementById('btn-process-csv').addEventListener('click', () => {
      const text = rawText.value.trim();
      if (!text) {
        SpendWise.Toast.warning('Please select a file or paste CSV text');
        return;
      }

      const parsed = SpendWise.Utils.parseTransactionsCSV(text);
      if (parsed.length === 0) {
        SpendWise.Toast.error('Could not parse any valid transactions from the input');
        return;
      }

      // Add parsed transactions to state
      parsed.forEach(tx => {
        SpendWise.State.addTransaction(tx);
      });

      SpendWise.Toast.success(`Successfully imported ${parsed.length} transactions!`);
      SpendWise.Modal.close();
    });

    document.getElementById('csv-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'csv-modal-overlay') SpendWise.Modal.close();
    });
  }
};

