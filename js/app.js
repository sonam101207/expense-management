/**
 * SpendWise — Main Application Orchestrator
 */
window.SpendWise = window.SpendWise || {};

SpendWise.App = {
  init() {
    // 1. Bootstrap storage (seed demo data on first run)
    SpendWise.Storage.initStorage();

    // 2. Initialize reactive state from storage
    SpendWise.State.init();

    // 3. Render the full shell layout (sidebar + topbar)
    this.renderShell();

    // 4. Set up date range selector UI
    this.initDateRangeSelector();

    // 5. Subscribe to state changes and re-render accordingly
    SpendWise.State.subscribe((event, payload) => {
      const rerenderViews = [
        'transaction_added', 'transaction_updated', 'transaction_deleted',
        'category_added', 'category_updated', 'category_deleted',
        'recurring_added', 'recurring_updated', 'recurring_deleted',
        'transactions_cleared', 'filters_changed', 'date_range_changed'
      ];

      if (rerenderViews.includes(event)) {
        this.renderCurrentView();
      }

      if (event === 'view_changed') {
        this.activateNavItem(payload.view);
        this.renderCurrentView();
      }

      if (event === 'currency_changed') {
        this.renderCurrentView();
      }
    });

    // 6. Render the initial view
    this.renderCurrentView();
  },

  renderShell() {
    const navItems = [
      { id: 'dashboard',    label: 'Dashboard',     icon: 'layout-dashboard' },
      { id: 'transactions', label: 'Transactions',  icon: 'list' },
      { id: 'categories',   label: 'Categories',    icon: 'tag' },
      { id: 'analytics',    label: 'Analytics',     icon: 'bar-chart-2' },
      { id: 'recurring',    label: 'Recurring',     icon: 'repeat' },
      { id: 'settings',     label: 'Settings',      icon: 'settings' }
    ];

    const settings = SpendWise.State.settings;
    const currency = SpendWise.Config.CURRENCIES.find(c => c.code === (settings.currency || 'USD')) || SpendWise.Config.CURRENCIES[0];

    document.getElementById('app-shell').innerHTML = `
      <!-- =================== SIDEBAR (desktop) =================== -->
      <aside id="sidebar"
        class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-100 shadow-sm transition-transform duration-300">

        <!-- Logo -->
        <div class="flex items-center space-x-2.5 px-5 py-5 border-b border-slate-100">
          <div class="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 20h20M5 20V10l7-7 7 7v10"/>
              <rect x="9" y="14" width="6" height="6" rx="1"/>
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-extrabold text-slate-900 leading-none">SpendWise</h1>
            <span class="text-[10px] text-slate-400 font-medium">Smart Expense Tracker</span>
          </div>
        </div>

        <!-- Navigation Items -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p class="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
          ${navItems.slice(0, 5).map(item => `
            <button
              id="nav-${item.id}"
              data-view="${item.id}"
              class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-left nav-btn">
              <i data-lucide="${item.icon}" class="w-4.5 h-4.5 shrink-0 nav-icon" style="width:18px;height:18px;"></i>
              <span>${item.label}</span>
            </button>
          `).join('')}

          <p class="px-2 pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</p>
          ${navItems.slice(5).map(item => `
            <button
              id="nav-${item.id}"
              data-view="${item.id}"
              class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-left nav-btn">
              <i data-lucide="${item.icon}" class="shrink-0 nav-icon" style="width:18px;height:18px;"></i>
              <span>${item.label}</span>
            </button>
          `).join('')}
        </nav>

        <!-- Bottom User/Currency pill -->
        <div class="px-3 py-4 border-t border-slate-100">
          <div class="flex items-center space-x-2.5 px-3 py-2.5 bg-slate-50 rounded-xl">
            <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              ${(settings.userName || 'Alex Morgan').charAt(0).toUpperCase()}
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-800 truncate">${SpendWise.Utils.sanitizeHTML(settings.userName || 'Alex Morgan')}</p>
              <p class="text-[10px] text-slate-400">${currency.symbol} ${currency.code}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- =================== MOBILE TOPBAR =================== -->
      <header class="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 py-3">
        <div class="flex items-center space-x-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 20h20M5 20V10l7-7 7 7v10"/>
              <rect x="9" y="14" width="6" height="6" rx="1"/>
            </svg>
          </div>
          <span class="text-sm font-extrabold text-slate-900">SpendWise</span>
        </div>
        <button id="mobile-menu-toggle" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
      </header>

      <!-- =================== MOBILE NAV DRAWER =================== -->
      <div id="mobile-nav-backdrop" class="lg:hidden fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" id="mobile-backdrop-dismiss"></div>
        <aside class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div class="flex items-center space-x-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 20h20M5 20V10l7-7 7 7v10"/>
                  <rect x="9" y="14" width="6" height="6" rx="1"/>
                </svg>
              </div>
              <span class="text-sm font-extrabold text-slate-900">SpendWise</span>
            </div>
            <button id="mobile-menu-close" class="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            ${navItems.map(item => `
              <button
                id="mobile-nav-${item.id}"
                data-view="${item.id}"
                class="nav-item mobile-nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-all text-left nav-btn">
                <i data-lucide="${item.icon}" class="shrink-0 nav-icon" style="width:18px;height:18px;"></i>
                <span>${item.label}</span>
              </button>
            `).join('')}
          </nav>
        </aside>
      </div>

      <!-- =================== MAIN CONTENT WRAPPER =================== -->
      <div class="lg:pl-60">
        <!-- Desktop Topbar / Breadcrumb + Date Range -->
        <div class="hidden lg:flex sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-8 py-3 items-center justify-between">
          <!-- Breadcrumb -->
          <div id="topbar-breadcrumb" class="flex items-center space-x-2 text-xs">
            <span class="text-slate-400">SpendWise</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-300"></i>
            <span id="topbar-current-view" class="font-semibold text-slate-700 capitalize">Dashboard</span>
          </div>

          <!-- Date Range Selector + Quick Add -->
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
              ${SpendWise.Config.DATE_RANGE_PRESETS.filter(p => p.id !== 'custom').map(preset => `
                <button
                  data-preset="${preset.id}"
                  class="date-preset-btn px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all
                    ${SpendWise.State.dateRangePreset === preset.id
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800'}">
                  ${preset.name}
                </button>
              `).join('')}
              <button data-preset="custom" id="btn-custom-range"
                class="date-preset-btn px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all text-slate-500 hover:text-slate-800 flex items-center space-x-1">
                <i data-lucide="calendar" style="width:12px;height:12px;"></i>
                <span>Custom</span>
              </button>
            </div>

            <!-- Custom Date Picker (hidden by default) -->
            <div id="custom-date-picker" class="hidden items-center space-x-2">
              <input type="date" id="custom-start-date" value="${SpendWise.State.customStartDate || ''}" class="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl form-input-focus">
              <span class="text-slate-400 text-xs">to</span>
              <input type="date" id="custom-end-date" value="${SpendWise.State.customEndDate || ''}" class="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl form-input-focus">
              <button id="apply-custom-range" class="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors">
                Apply
              </button>
            </div>

            <button id="topbar-add-tx" class="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-sm transition-all">
              <i data-lucide="plus" style="width:14px;height:14px;"></i>
              <span>Add</span>
            </button>
          </div>
        </div>

        <!-- Mobile Topbar spacer + Date Presets -->
        <div class="lg:hidden pt-14 pb-2 px-4 bg-white border-b border-slate-100">
          <div class="flex overflow-x-auto space-x-1 py-1 scrollbar-none">
            ${SpendWise.Config.DATE_RANGE_PRESETS.filter(p => p.id !== 'custom').slice(0,4).map(preset => `
              <button
                data-preset="${preset.id}"
                class="date-preset-btn shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all
                  ${SpendWise.State.dateRangePreset === preset.id
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600'}">
                ${preset.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Page Content Area -->
        <main class="p-4 md:p-6 lg:p-8 min-h-screen" id="main-content-area">
          <!-- Rendered by components -->
        </main>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this.attachShellEvents();
    this.activateNavItem(SpendWise.State.currentView);
  },

  attachShellEvents() {
    // Desktop & Mobile Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) {
          SpendWise.State.setView(view);
          // Close mobile nav if open
          document.getElementById('mobile-nav-backdrop')?.classList.add('hidden');
        }
      });
    });

    // Date preset buttons
    document.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'custom') {
          document.getElementById('custom-date-picker')?.classList.toggle('hidden');
          document.getElementById('custom-date-picker')?.classList.toggle('flex');
        } else {
          SpendWise.State.setDateRangePreset(preset);
          document.getElementById('custom-date-picker')?.classList.add('hidden');
          document.getElementById('custom-date-picker')?.classList.remove('flex');
          // Update active state
          document.querySelectorAll('.date-preset-btn').forEach(b => {
            b.classList.remove('bg-white', 'text-slate-900', 'shadow-sm', 'font-semibold', 'bg-emerald-700', 'text-white');
            b.classList.add('text-slate-500');
          });
          btn.classList.remove('text-slate-500', 'text-slate-600');
          btn.classList.add('bg-white', 'text-slate-900', 'shadow-sm', 'font-semibold');
        }
      });
    });

    // Apply custom range
    document.getElementById('apply-custom-range')?.addEventListener('click', () => {
      const start = document.getElementById('custom-start-date')?.value;
      const end = document.getElementById('custom-end-date')?.value;
      if (start && end && start <= end) {
        SpendWise.State.setDateRangePreset('custom', start, end);
        SpendWise.Toast.info(`Showing: ${SpendWise.Utils.formatDate(start, 'short')} — ${SpendWise.Utils.formatDate(end, 'short')}`);
      } else {
        SpendWise.Toast.warning('Please select a valid date range (start ≤ end)');
      }
    });

    // Topbar Add button
    document.getElementById('topbar-add-tx')?.addEventListener('click', () => {
      SpendWise.Modal.openTransactionModal();
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
      document.getElementById('mobile-nav-backdrop')?.classList.remove('hidden');
    });

    document.getElementById('mobile-menu-close')?.addEventListener('click', () => {
      document.getElementById('mobile-nav-backdrop')?.classList.add('hidden');
    });

    document.getElementById('mobile-backdrop-dismiss')?.addEventListener('click', () => {
      document.getElementById('mobile-nav-backdrop')?.classList.add('hidden');
    });
  },

  initDateRangeSelector() {
    // Sync input values
    const startInput = document.getElementById('custom-start-date');
    const endInput = document.getElementById('custom-end-date');
    if (startInput) startInput.value = SpendWise.State.customStartDate || '';
    if (endInput) endInput.value = SpendWise.State.customEndDate || '';
  },

  activateNavItem(viewId) {
    // Remove active from all
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
    });

    // Add to both desktop and mobile nav items for this view
    const desktopNav = document.getElementById(`nav-${viewId}`);
    const mobileNav = document.getElementById(`mobile-nav-${viewId}`);
    if (desktopNav) desktopNav.classList.add('active');
    if (mobileNav) mobileNav.classList.add('active');

    // Update breadcrumb label
    const labels = {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      categories: 'Categories & Budgets',
      analytics: 'Analytics & Insights',
      recurring: 'Recurring Payments',
      settings: 'Settings'
    };
    const breadcrumb = document.getElementById('topbar-current-view');
    if (breadcrumb) breadcrumb.textContent = labels[viewId] || viewId;
  },

  renderCurrentView() {
    const view = SpendWise.State.currentView;
    switch (view) {
      case 'dashboard':    SpendWise.Dashboard.render();    break;
      case 'transactions': SpendWise.Transactions.render(); break;
      case 'categories':   SpendWise.Categories.render();   break;
      case 'analytics':    SpendWise.Analytics.render();    break;
      case 'recurring':    SpendWise.Recurring.render();    break;
      case 'settings':     SpendWise.Settings.render();     break;
      default:             SpendWise.Dashboard.render();    break;
    }
  }
};

// Boot the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  SpendWise.App.init();
});

