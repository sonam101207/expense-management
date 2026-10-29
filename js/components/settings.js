/**
 * SpendWise — Settings Component
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Settings = {
  render() {
    const settings = SpendWise.State.settings;
    const txCount = SpendWise.State.transactions.length;
    const catCount = SpendWise.State.categories.length;
    const recCount = SpendWise.State.recurring.length;
    const currency = settings.currency || 'USD';

    const storageEstimate = Math.round(JSON.stringify({
      transactions: SpendWise.Storage.getTransactions(),
      categories: SpendWise.Storage.getCategories(),
      recurring: SpendWise.Storage.getRecurring()
    }).length / 1024);

    const html = `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Settings & Preferences</h1>
          <p class="text-xs text-slate-500 mt-1">Configure currency, profile, and manage your application data.</p>
        </div>

        <!-- General Settings Card -->
        <div class="premium-card p-6">
          <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <i data-lucide="settings" class="w-4 h-4 text-slate-500"></i>
            <span>General Preferences</span>
          </h3>

          <div class="space-y-5">
            <!-- User Name -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label class="text-xs font-semibold text-slate-700">Display Name</label>
                <p class="text-[11px] text-slate-400 mt-0.5">Used in the welcome message</p>
              </div>
              <div class="sm:col-span-2">
                <input type="text" id="set-name" value="${SpendWise.Utils.sanitizeHTML(settings.userName || 'Alex Morgan')}" class="w-full max-w-xs px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
              </div>
            </div>

            <!-- Currency -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border-t border-slate-100 pt-5">
              <div>
                <label class="text-xs font-semibold text-slate-700">Currency</label>
                <p class="text-[11px] text-slate-400 mt-0.5">Used for all monetary values</p>
              </div>
              <div class="sm:col-span-2">
                <select id="set-currency" class="w-full max-w-xs px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                  ${SpendWise.Config.CURRENCIES.map(c => `
                    <option value="${c.code}" ${c.code === currency ? 'selected' : ''}>
                      ${c.symbol} — ${c.name} (${c.code})
                    </option>
                  `).join('')}
                </select>
                <p class="text-[11px] text-slate-400 mt-1">Note: Existing transaction amounts are not converted.</p>
              </div>
            </div>

            <!-- Monthly Budget Goal -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border-t border-slate-100 pt-5">
              <div>
                <label class="text-xs font-semibold text-slate-700">Monthly Budget Goal</label>
                <p class="text-[11px] text-slate-400 mt-0.5">Your overall monthly spending target</p>
              </div>
              <div class="sm:col-span-2 flex items-center space-x-3">
                <div class="relative max-w-xs w-full">
                  <span class="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">
                    ${SpendWise.Config.CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
                  </span>
                  <input type="number" id="set-budget" min="0" step="100" value="${settings.monthlyBudgetGoal || 4200}" class="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl form-input-focus">
                </div>
                <span class="text-xs text-slate-400">/ month</span>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100">
            <button id="btn-save-settings" class="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 shadow-sm rounded-xl transition-all">
              Save Preferences
            </button>
          </div>
        </div>

        <!-- Data Management Card -->
        <div class="premium-card p-6">
          <h3 class="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-2">
            <i data-lucide="database" class="w-4 h-4 text-slate-500"></i>
            <span>Data Management</span>
          </h3>
          <p class="text-xs text-slate-400 mb-5">Export, import, or reset your SpendWise financial data.</p>

          <!-- Data Stats -->
          <div class="grid grid-cols-3 gap-3 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div class="text-center">
              <p class="text-xl font-bold text-slate-900">${txCount}</p>
              <p class="text-[11px] text-slate-500">Transactions</p>
            </div>
            <div class="text-center border-x border-slate-200">
              <p class="text-xl font-bold text-slate-900">${catCount}</p>
              <p class="text-[11px] text-slate-500">Categories</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-slate-900">${recCount}</p>
              <p class="text-[11px] text-slate-500">Recurring Rules</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 mb-5">
            Estimated storage used: <strong class="text-slate-600">~${storageEstimate} KB</strong> (localStorage)
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Export JSON -->
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div class="flex items-center space-x-2.5 mb-2">
                <i data-lucide="download-cloud" class="w-5 h-5 text-blue-600"></i>
                <span class="text-xs font-semibold text-slate-800">Export Full Backup (JSON)</span>
              </div>
              <p class="text-[11px] text-slate-500 mb-3">Download all transactions, categories, and settings as a JSON backup file.</p>
              <button id="btn-export-json" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
                Export Backup
              </button>
            </div>

            <!-- Export Transactions CSV -->
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div class="flex items-center space-x-2.5 mb-2">
                <i data-lucide="file-spreadsheet" class="w-5 h-5 text-emerald-600"></i>
                <span class="text-xs font-semibold text-slate-800">Export Transactions (CSV)</span>
              </div>
              <p class="text-[11px] text-slate-500 mb-3">Download all ${txCount} transactions as a CSV file compatible with Excel and Google Sheets.</p>
              <button id="btn-export-csv-all" class="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm">
                Export All CSV
              </button>
            </div>

            <!-- Import JSON -->
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div class="flex items-center space-x-2.5 mb-2">
                <i data-lucide="upload-cloud" class="w-5 h-5 text-purple-600"></i>
                <span class="text-xs font-semibold text-slate-800">Import JSON Backup</span>
              </div>
              <p class="text-[11px] text-slate-500 mb-3">Restore a previously exported SpendWise JSON backup file. This will merge with existing data.</p>
              <label class="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm inline-block">
                Choose File
                <input type="file" id="btn-import-json" accept=".json,application/json" class="hidden">
              </label>
            </div>

            <!-- Import CSV -->
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div class="flex items-center space-x-2.5 mb-2">
                <i data-lucide="table" class="w-5 h-5 text-amber-600"></i>
                <span class="text-xs font-semibold text-slate-800">Import Transactions CSV</span>
              </div>
              <p class="text-[11px] text-slate-500 mb-3">Import transactions from a compatible CSV file. Required columns: Date, Type, Title, Amount.</p>
              <button id="btn-import-csv-settings" class="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm">
                Import CSV
              </button>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="premium-card p-6 border-rose-100">
          <h3 class="text-sm font-bold text-rose-700 mb-1 flex items-center space-x-2">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
            <span>Danger Zone</span>
          </h3>
          <p class="text-xs text-slate-500 mb-5">These actions are irreversible. Proceed with caution.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-4 rounded-xl border border-rose-100 bg-rose-50/30">
              <p class="text-xs font-semibold text-slate-800 mb-1">Reset to Demo Data</p>
              <p class="text-[11px] text-slate-500 mb-3">Wipe all custom data and reload the sample dataset for demonstration purposes.</p>
              <button id="btn-reset-demo" class="px-4 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors shadow-sm">
                Reset to Demo
              </button>
            </div>
            <div class="p-4 rounded-xl border border-rose-100 bg-rose-50/30">
              <p class="text-xs font-semibold text-slate-800 mb-1">Delete All Transactions</p>
              <p class="text-[11px] text-slate-500 mb-3">Permanently delete all transaction records. Categories and settings are preserved.</p>
              <button id="btn-delete-all-tx" class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm">
                Delete All Transactions
              </button>
            </div>
          </div>
        </div>

        <!-- About Card -->
        <div class="premium-card-flat p-5 bg-white flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <i data-lucide="wallet" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">SpendWise — Smart Expense Tracker</p>
              <p class="text-[11px] text-slate-400">v1.0.0 &bull; Built with HTML5, CSS3, Tailwind CSS, Chart.js &bull; Vanilla JS only</p>
            </div>
          </div>
          <span class="text-[11px] font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            Offline Ready
          </span>
        </div>
      </div>
    `;

    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;
    mainContainer.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Save settings
    document.getElementById('btn-save-settings')?.addEventListener('click', () => {
      const name = document.getElementById('set-name').value.trim();
      const currency = document.getElementById('set-currency').value;
      const budget = parseFloat(document.getElementById('set-budget').value) || 4200;

      SpendWise.State.settings.userName = name || 'Alex Morgan';
      SpendWise.State.settings.monthlyBudgetGoal = budget;
      SpendWise.State.setCurrency(currency);
      SpendWise.Storage.saveSettings(SpendWise.State.settings);
      SpendWise.Toast.success('Preferences saved successfully!');
    });

    // Export JSON
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      SpendWise.Storage.exportAllJSON();
      SpendWise.Toast.success('Full backup exported as JSON');
    });

    // Export CSV (all transactions)
    document.getElementById('btn-export-csv-all')?.addEventListener('click', () => {
      const csv = SpendWise.Utils.transactionsToCSV(SpendWise.State.transactions, SpendWise.State.categories);
      SpendWise.Utils.downloadFile(`spendwise_all_transactions_${new Date().toISOString().split('T')[0]}.csv`, csv);
      SpendWise.Toast.success('All transactions exported as CSV');
    });

    // Import JSON
    document.getElementById('btn-import-json')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = SpendWise.Storage.importAllJSON(evt.target.result);
        if (result.success) {
          SpendWise.State.init();
          SpendWise.Toast.success(`Imported ${result.count} transactions from backup!`);
          SpendWise.App.renderCurrentView();
        } else {
          SpendWise.Toast.error(`Import failed: ${result.error}`);
        }
      };
      reader.readAsText(file);
    });

    // Import CSV
    document.getElementById('btn-import-csv-settings')?.addEventListener('click', () => {
      SpendWise.Modal.openCSVImportModal();
    });

    // Reset to demo
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      SpendWise.Modal.confirmDelete(
        'Reset to Demo Data',
        'This will permanently delete ALL your custom transactions, categories, and recurring rules, and reload the sample demo dataset. This cannot be undone.',
        () => {
          SpendWise.Storage.resetToDemoData();
          SpendWise.State.init();
          SpendWise.Toast.success('Application reset to demo data successfully!');
          SpendWise.State.setView('dashboard');
        }
      );
    });

    // Delete all transactions
    document.getElementById('btn-delete-all-tx')?.addEventListener('click', () => {
      SpendWise.Modal.confirmDelete(
        'Delete All Transactions',
        `This will permanently delete all ${txCount} transactions. Categories and settings will remain. This action cannot be undone.`,
        () => {
          SpendWise.State.transactions = [];
          SpendWise.Storage.saveTransactions([]);
          SpendWise.State.notify('transactions_cleared');
          SpendWise.Toast.success('All transactions deleted successfully');
          SpendWise.Settings.render();
        }
      );
    });
  }
};

