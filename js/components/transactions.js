/**
 * SpendWise — Transactions Management Component
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Transactions = {
  render() {
    const currency = SpendWise.State.settings.currency || 'USD';
    const categories = SpendWise.State.categories;
    const paymentMethods = SpendWise.Config.PAYMENT_METHODS;

    // Get filtered & sorted transactions
    const filteredTxs = SpendWise.State.getFilteredTransactions(false); // Can view across all or respect date filter
    const totalCount = filteredTxs.length;

    // Pagination math
    const page = SpendWise.State.currentPage;
    const perPage = SpendWise.State.itemsPerPage;
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
    const startIndex = (page - 1) * perPage;
    const pageTransactions = filteredTxs.slice(startIndex, startIndex + perPage);

    // Sum of filtered amounts
    let filteredIncome = 0;
    let filteredExpense = 0;
    filteredTxs.forEach(t => {
      if (t.type === 'income') filteredIncome += t.amount;
      else filteredExpense += t.amount;
    });

    const html = `
      <div class="space-y-6 animate-fade-in">
        <!-- Header Banner with Title & Quick Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h1>
            <p class="text-xs text-slate-500 mt-1">
              Showing ${totalCount} records &bull; Income: <span class="font-semibold text-emerald-600">${SpendWise.Utils.formatCurrency(filteredIncome, currency)}</span> &bull; Expenses: <span class="font-semibold text-rose-600">${SpendWise.Utils.formatCurrency(filteredExpense, currency)}</span>
            </p>
          </div>

          <div class="flex items-center space-x-2.5">
            <button id="btn-tx-import-csv" class="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm">
              <i data-lucide="upload" class="w-4 h-4 text-slate-500"></i>
              <span>Import CSV</span>
            </button>

            <button id="btn-tx-export-csv" class="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm">
              <i data-lucide="download" class="w-4 h-4 text-slate-500"></i>
              <span>Export CSV</span>
            </button>

            <button id="btn-tx-add-new" class="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-sm transition-all">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="premium-card p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <!-- Search Input -->
            <div class="lg:col-span-2 relative">
              <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
              <input type="text" id="tx-search-input" class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl form-input-focus placeholder-slate-400" placeholder="Search title, merchant, notes..." value="${SpendWise.Utils.sanitizeHTML(SpendWise.State.searchQuery)}">
              ${SpendWise.State.searchQuery ? `
                <button id="btn-clear-search" class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
            </div>

            <!-- Type Filter -->
            <div>
              <select id="filter-type-select" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl form-input-focus">
                <option value="all" ${SpendWise.State.filterType === 'all' ? 'selected' : ''}>All Types</option>
                <option value="expense" ${SpendWise.State.filterType === 'expense' ? 'selected' : ''}>Expenses Only</option>
                <option value="income" ${SpendWise.State.filterType === 'income' ? 'selected' : ''}>Income Only</option>
              </select>
            </div>

            <!-- Category Filter -->
            <div>
              <select id="filter-cat-select" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl form-input-focus">
                <option value="all" ${SpendWise.State.filterCategoryId === 'all' ? 'selected' : ''}>All Categories</option>
                ${categories.map(c => `
                  <option value="${c.id}" ${SpendWise.State.filterCategoryId === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <select id="filter-sort-select" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl form-input-focus">
                <option value="date-desc" ${SpendWise.State.sortBy === 'date-desc' ? 'selected' : ''}>Date: Newest First</option>
                <option value="date-asc" ${SpendWise.State.sortBy === 'date-asc' ? 'selected' : ''}>Date: Oldest First</option>
                <option value="amount-desc" ${SpendWise.State.sortBy === 'amount-desc' ? 'selected' : ''}>Amount: High to Low</option>
                <option value="amount-asc" ${SpendWise.State.sortBy === 'amount-asc' ? 'selected' : ''}>Amount: Low to High</option>
                <option value="title-asc" ${SpendWise.State.sortBy === 'title-asc' ? 'selected' : ''}>Title: A to Z</option>
              </select>
            </div>
          </div>

          <!-- Secondary Filters Row (Payment method & Reset) -->
          <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div class="flex items-center space-x-2">
              <span class="text-slate-400 font-medium">Payment Method:</span>
              <div class="flex flex-wrap gap-1.5">
                <button class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${SpendWise.State.filterPaymentMethod === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-pm="all">
                  All
                </button>
                ${paymentMethods.map(pm => `
                  <button class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${SpendWise.State.filterPaymentMethod === pm.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-pm="${pm.id}">
                    ${pm.name}
                  </button>
                `).join('')}
              </div>
            </div>

            ${(SpendWise.State.searchQuery || SpendWise.State.filterType !== 'all' || SpendWise.State.filterCategoryId !== 'all' || SpendWise.State.filterPaymentMethod !== 'all') ? `
              <button id="btn-reset-filters" class="text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>Reset Filters</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Transactions Table Card -->
        <div class="premium-card overflow-hidden">
          ${totalCount === 0 ? `
            <div class="py-16 text-center px-4">
              <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <i data-lucide="search-x" class="w-7 h-7"></i>
              </div>
              <h3 class="text-base font-semibold text-slate-800">No transactions found</h3>
              <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No records match your active search and filter settings. Try clearing your filters or add a new entry.
              </p>
              <div class="mt-4 flex items-center justify-center space-x-3">
                <button class="px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors" onclick="SpendWise.Transactions.resetFilters()">
                  Clear Filters
                </button>
                <button class="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors" onclick="SpendWise.Modal.openTransactionModal()">
                  Add Transaction
                </button>
              </div>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th class="py-3 px-4">Date</th>
                    <th class="py-3 px-4">Description / Merchant</th>
                    <th class="py-3 px-4">Category</th>
                    <th class="py-3 px-4">Payment Method</th>
                    <th class="py-3 px-4 text-right">Amount</th>
                    <th class="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  ${pageTransactions.map(tx => {
                    const cat = categories.find(c => c.id === tx.categoryId);
                    const pm = paymentMethods.find(p => p.id === tx.paymentMethod);
                    const isIncome = tx.type === 'income';

                    return `
                      <tr class="table-row-hover transition-colors group">
                        <!-- Date -->
                        <td class="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                          ${SpendWise.Utils.formatDate(tx.date, 'short')}
                          <span class="text-[10px] text-slate-400 block">${tx.date.split('-')[0]}</span>
                        </td>

                        <!-- Title & Merchant -->
                        <td class="py-3 px-4 min-w-[200px]">
                          <div class="flex items-center space-x-2.5">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}">
                              <i data-lucide="${cat ? cat.icon : 'tag'}" class="w-4 h-4"></i>
                            </div>
                            <div class="min-w-0">
                              <p class="font-semibold text-slate-800 truncate">${SpendWise.Utils.sanitizeHTML(tx.title)}</p>
                              <div class="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                                ${tx.merchant ? `<span class="text-slate-500 font-medium">${SpendWise.Utils.sanitizeHTML(tx.merchant)}</span>` : ''}
                                ${tx.subcategory ? `<span>&bull;</span><span>${SpendWise.Utils.sanitizeHTML(tx.subcategory)}</span>` : ''}
                                ${tx.isRecurring ? `<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-blue-50 text-blue-600 font-medium">Recurring</span>` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <!-- Category Badge -->
                        <td class="py-3 px-4 whitespace-nowrap">
                          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium" style="background-color: ${cat ? cat.color + '18' : '#f1f5f9'}; color: ${cat ? cat.color : '#334155'};">
                            <span class="w-1.5 h-1.5 rounded-full mr-1.5" style="background-color: ${cat ? cat.color : '#334155'};"></span>
                            ${cat ? cat.name : 'Uncategorized'}
                          </span>
                        </td>

                        <!-- Payment Method -->
                        <td class="py-3 px-4 whitespace-nowrap text-slate-600">
                          <div class="flex items-center space-x-1.5">
                            <i data-lucide="${pm ? pm.icon : 'credit-card'}" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span>${pm ? pm.name : 'Card'}</span>
                          </div>
                        </td>

                        <!-- Amount -->
                        <td class="py-3 px-4 text-right whitespace-nowrap font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}">
                          ${isIncome ? '+' : '-'}${SpendWise.Utils.formatCurrency(tx.amount, currency)}
                        </td>

                        <!-- Actions -->
                        <td class="py-3 px-4 text-center whitespace-nowrap">
                          <div class="inline-flex items-center space-x-1">
                            <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit" onclick="SpendWise.Modal.openTransactionModal('${tx.id}')">
                              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                            </button>
                            <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete" onclick="SpendWise.Transactions.confirmDelete('${tx.id}')">
                              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Pagination Bar -->
            <div class="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div class="flex items-center space-x-3">
                <span>
                  Showing <strong class="text-slate-700">${startIndex + 1}</strong> to <strong class="text-slate-700">${Math.min(startIndex + perPage, totalCount)}</strong> of <strong class="text-slate-700">${totalCount}</strong> transactions
                </span>

                <div class="flex items-center space-x-1.5">
                  <span>Per page:</span>
                  <select id="select-per-page" class="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs">
                    <option value="10" ${perPage === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${perPage === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${perPage === 50 ? 'selected' : ''}>50</option>
                  </select>
                </div>
              </div>

              <!-- Page navigation buttons -->
              <div class="flex items-center space-x-1.5 self-end sm:self-auto">
                <button id="btn-page-prev" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" ${page <= 1 ? 'disabled' : ''}>
                  Previous
                </button>
                <span class="px-2 font-medium text-slate-700">
                  Page ${page} of ${totalPages}
                </span>
                <button id="btn-page-next" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed" ${page >= totalPages ? 'disabled' : ''}>
                  Next
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;
    mainContainer.innerHTML = html;

    if (window.lucide) lucide.createIcons();
    this.attachEventListeners();
  },

  attachEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('tx-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', SpendWise.Utils.debounce((e) => {
        SpendWise.State.setFilters({ search: e.target.value, page: 1 });
      }, 300));
    }

    document.getElementById('btn-clear-search')?.addEventListener('click', () => {
      SpendWise.State.setFilters({ search: '', page: 1 });
    });

    // Type filter
    document.getElementById('filter-type-select')?.addEventListener('change', (e) => {
      SpendWise.State.setFilters({ type: e.target.value, page: 1 });
    });

    // Category filter
    document.getElementById('filter-cat-select')?.addEventListener('change', (e) => {
      SpendWise.State.setFilters({ categoryId: e.target.value, page: 1 });
    });

    // Sort select
    document.getElementById('filter-sort-select')?.addEventListener('change', (e) => {
      SpendWise.State.setFilters({ sort: e.target.value });
    });

    // Payment method pills
    document.querySelectorAll('[data-pm]').forEach(btn => {
      btn.addEventListener('click', () => {
        SpendWise.State.setFilters({ paymentMethod: btn.dataset.pm, page: 1 });
      });
    });

    // Reset filters button
    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      this.resetFilters();
    });

    // Pagination
    document.getElementById('btn-page-prev')?.addEventListener('click', () => {
      if (SpendWise.State.currentPage > 1) {
        SpendWise.State.setFilters({ page: SpendWise.State.currentPage - 1 });
      }
    });

    document.getElementById('btn-page-next')?.addEventListener('click', () => {
      SpendWise.State.setFilters({ page: SpendWise.State.currentPage + 1 });
    });

    document.getElementById('select-per-page')?.addEventListener('change', (e) => {
      SpendWise.State.setFilters({ perPage: parseInt(e.target.value, 10), page: 1 });
    });

    // Action buttons
    document.getElementById('btn-tx-add-new')?.addEventListener('click', () => {
      SpendWise.Modal.openTransactionModal();
    });

    document.getElementById('btn-tx-import-csv')?.addEventListener('click', () => {
      SpendWise.Modal.openCSVImportModal();
    });

    document.getElementById('btn-tx-export-csv')?.addEventListener('click', () => {
      const filtered = SpendWise.State.getFilteredTransactions(false);
      const csv = SpendWise.Utils.transactionsToCSV(filtered, SpendWise.State.categories);
      SpendWise.Utils.downloadFile(`spendwise_transactions_filtered_${new Date().toISOString().split('T')[0]}.csv`, csv);
      SpendWise.Toast.success(`Exported ${filtered.length} transactions to CSV`);
    });
  },

  resetFilters() {
    SpendWise.State.setFilters({
      search: '',
      type: 'all',
      categoryId: 'all',
      paymentMethod: 'all',
      sort: 'date-desc',
      page: 1
    });
  },

  confirmDelete(txId) {
    const tx = SpendWise.State.transactions.find(t => t.id === txId);
    if (!tx) return;

    SpendWise.Modal.confirmDelete(
      'Delete Transaction',
      `Are you sure you want to permanently delete "${tx.title}" (${SpendWise.Utils.formatCurrency(tx.amount, SpendWise.State.settings.currency)})? This action cannot be undone.`,
      () => {
        SpendWise.State.deleteTransaction(txId);
        SpendWise.Toast.success('Transaction deleted');
      }
    );
  }
};

