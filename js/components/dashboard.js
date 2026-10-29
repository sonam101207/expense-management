/**
 * SpendWise — Dashboard Overview Component
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Dashboard = {
  render() {
    const metrics = SpendWise.State.getDashboardMetrics();
    const currency = SpendWise.State.settings.currency || 'USD';
    const recentTransactions = SpendWise.State.transactions.slice(0, 5);

    // Welcome greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const fullDate = SpendWise.Utils.formatDate(new Date(), 'full');

    const html = `
      <div class="space-y-6 animate-fade-in">
        <!-- Top Welcome & Status Banner -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-6 rounded-2xl border border-emerald-100/80 shadow-sm">
          <div>
            <div class="flex items-center space-x-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Live Overview
              </span>
              <span class="text-xs text-slate-500">${fullDate}</span>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 mt-1 tracking-tight">${greeting}, Alex!</h1>
            <p class="text-xs text-slate-600 mt-1 max-w-xl">
              ${metrics.healthAdvice}
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center space-x-3 shrink-0">
            <button id="btn-dash-add-tx" class="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-sm transition-all">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Transaction</span>
            </button>
            <button id="btn-dash-export" class="inline-flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm">
              <i data-lucide="download" class="w-4 h-4 text-slate-500"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <!-- 4 Primary Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Income -->
          <div class="premium-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-2">
              <h3 class="text-2xl font-bold text-slate-900 tracking-tight">
                ${SpendWise.Utils.formatCurrency(metrics.totalIncome, currency)}
              </h3>
              <div class="flex items-center mt-2 text-xs">
                <span class="font-medium ${metrics.incomeChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'} flex items-center">
                  <i data-lucide="${metrics.incomeChangePercent >= 0 ? 'trending-up' : 'trending-down'}" class="w-3.5 h-3.5 mr-1"></i>
                  ${SpendWise.Utils.formatPercentage(metrics.incomeChangePercent, true)}
                </span>
                <span class="text-slate-400 ml-1.5">vs prior period</span>
              </div>
            </div>
          </div>

          <!-- Total Expenses -->
          <div class="premium-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
              <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-2">
              <h3 class="text-2xl font-bold text-slate-900 tracking-tight">
                ${SpendWise.Utils.formatCurrency(metrics.totalExpenses, currency)}
              </h3>
              <div class="flex items-center mt-2 text-xs">
                <!-- If expense change is positive, spending increased (rose). If negative, spending decreased (emerald) -->
                <span class="font-medium ${metrics.expenseChangePercent > 0 ? 'text-rose-600' : 'text-emerald-600'} flex items-center">
                  <i data-lucide="${metrics.expenseChangePercent > 0 ? 'trending-up' : 'trending-down'}" class="w-3.5 h-3.5 mr-1"></i>
                  ${SpendWise.Utils.formatPercentage(metrics.expenseChangePercent, true)}
                </span>
                <span class="text-slate-400 ml-1.5">vs prior period</span>
              </div>
            </div>
          </div>

          <!-- Net Savings & Rate -->
          <div class="premium-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Savings</span>
              <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <i data-lucide="piggy-bank" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-2">
              <h3 class="text-2xl font-bold ${metrics.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'} tracking-tight">
                ${SpendWise.Utils.formatCurrency(metrics.savingsAmount, currency)}
              </h3>
              <div class="flex items-center mt-2 text-xs">
                <span class="font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                  ${SpendWise.Utils.formatPercentage(metrics.savingsRate)} saved
                </span>
                <span class="text-slate-400 ml-1.5">of total income</span>
              </div>
            </div>
          </div>

          <!-- Budget Utilization -->
          <div class="premium-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Spent</span>
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <i data-lucide="pie-chart" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-2">
              <div class="flex items-baseline justify-between">
                <h3 class="text-2xl font-bold text-slate-900 tracking-tight">
                  ${SpendWise.Utils.formatPercentage(metrics.budgetUtilization)}
                </h3>
                <span class="text-xs text-slate-500">
                  of ${SpendWise.Utils.formatCurrency(metrics.totalBudget, currency, false)}
                </span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500 ${metrics.budgetUtilization > 100 ? 'bg-rose-500' : (metrics.budgetUtilization > 85 ? 'bg-amber-500' : 'bg-emerald-600')}" style="width: ${Math.min(100, metrics.budgetUtilization)}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Secondary Key Insight Pills -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Average Daily Spending -->
          <div class="premium-card-flat p-4 bg-white flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <i data-lucide="calendar" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-[11px] font-medium text-slate-400">Daily Average Spend</p>
              <p class="text-sm font-bold text-slate-800">
                ${SpendWise.Utils.formatCurrency(metrics.averageDailySpending, currency)}<span class="text-xs font-normal text-slate-400">/day</span>
              </p>
            </div>
          </div>

          <!-- Largest Expense Category -->
          <div class="premium-card-flat p-4 bg-white flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <i data-lucide="${metrics.largestCategory ? metrics.largestCategory.icon : 'tag'}" class="w-5 h-5"></i>
            </div>
            <div class="truncate">
              <p class="text-[11px] font-medium text-slate-400">Top Expense Area</p>
              <p class="text-sm font-bold text-slate-800 truncate">
                ${metrics.largestCategory ? metrics.largestCategory.name : 'None'}
              </p>
              <p class="text-[11px] text-slate-500">
                ${metrics.largestCategory ? `${SpendWise.Utils.formatCurrency(metrics.largestCategory.amount, currency)} (${metrics.largestCategory.percentage.toFixed(0)}%)` : '$0'}
              </p>
            </div>
          </div>

          <!-- Upcoming Recurring Bills -->
          <div class="premium-card-flat p-4 bg-white flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <i data-lucide="repeat" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-[11px] font-medium text-slate-400">Upcoming Bills (14d)</p>
              <p class="text-sm font-bold text-slate-800">
                ${metrics.upcomingRecurring.length} Scheduled
              </p>
              <p class="text-[11px] text-slate-500">
                Total: ${SpendWise.Utils.formatCurrency(metrics.upcomingRecurring.reduce((sum, r) => sum + r.amount, 0), currency)}
              </p>
            </div>
          </div>

          <!-- Financial Health Score -->
          <div class="premium-card-flat p-4 bg-white flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <i data-lucide="award" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-[11px] font-medium text-slate-400">Financial Health Score</p>
              <div class="flex items-center space-x-2">
                <span class="text-base font-extrabold text-slate-900">${metrics.healthScore}/100</span>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${metrics.healthBadgeColor}">
                  ${metrics.healthLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid (Cash Flow & Expense Distribution) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cash Flow / Monthly Trend -->
          <div class="premium-card p-6 lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-slate-800">Income vs. Expense History</h3>
                <p class="text-xs text-slate-500">Monthly cash flow trend over the past 6 months</p>
              </div>
              <button class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1" onclick="SpendWise.State.setView('analytics')">
                <span>Detailed Analytics</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <div class="h-64 chart-container">
              <canvas id="dash-chart-cashflow"></canvas>
            </div>
          </div>

          <!-- Category Doughnut Distribution -->
          <div class="premium-card p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-slate-800">Expense Breakdown</h3>
                <p class="text-xs text-slate-500">Spending share for ${metrics.periodLabel}</p>
              </div>
            </div>
            <div class="h-64 chart-container">
              <canvas id="dash-chart-doughnut"></canvas>
            </div>
          </div>
        </div>

        <!-- Bottom Grid: Recent Transactions & Recurring Bills & Budget Progress -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Recent Transactions (2 cols on desktop) -->
          <div class="premium-card p-6 lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-slate-800">Recent Transactions</h3>
                <p class="text-xs text-slate-500">Latest activity across your connected sources</p>
              </div>
              <button class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1" onclick="SpendWise.State.setView('transactions')">
                <span>View All (${SpendWise.State.transactions.length})</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <!-- Transactions List -->
            <div class="divide-y divide-slate-100">
              ${recentTransactions.length === 0 ? `
                <div class="py-8 text-center">
                  <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-300 mb-2"></i>
                  <p class="text-sm text-slate-500">No transactions recorded yet</p>
                </div>
              ` : recentTransactions.map(tx => {
                const cat = SpendWise.State.categories.find(c => c.id === tx.categoryId);
                const isIncome = tx.type === 'income';
                return `
                  <div class="py-3 flex items-center justify-between hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-colors">
                    <div class="flex items-center space-x-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}">
                        <i data-lucide="${cat ? cat.icon : (isIncome ? 'arrow-down-left' : 'shopping-bag')}" class="w-5 h-5"></i>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-slate-800 truncate">${SpendWise.Utils.sanitizeHTML(tx.title)}</p>
                        <div class="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                          <span>${SpendWise.Utils.formatDate(tx.date, 'short')}</span>
                          <span>&bull;</span>
                          <span class="truncate">${cat ? cat.name : 'General'}</span>
                          ${tx.merchant ? `<span>&bull;</span><span class="truncate text-slate-500">${SpendWise.Utils.sanitizeHTML(tx.merchant)}</span>` : ''}
                        </div>
                      </div>
                    </div>

                    <div class="text-right shrink-0 ml-4">
                      <p class="text-sm font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}">
                        ${isIncome ? '+' : '-'}${SpendWise.Utils.formatCurrency(tx.amount, currency)}
                      </p>
                      <button class="text-[11px] text-slate-400 hover:text-emerald-700 transition-colors mt-0.5" onclick="SpendWise.Modal.openTransactionModal('${tx.id}')">
                        Edit
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Upcoming Recurring Payments & Budgets Overview -->
          <div class="space-y-6">
            <!-- Upcoming Bills Card -->
            <div class="premium-card p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-base font-bold text-slate-800">Upcoming Bills</h3>
                  <p class="text-xs text-slate-500">Due within next 14 days</p>
                </div>
                <button class="text-xs font-semibold text-emerald-700 hover:text-emerald-800" onclick="SpendWise.State.setView('recurring')">
                  Manage
                </button>
              </div>

              <div class="space-y-3">
                ${metrics.upcomingRecurring.length === 0 ? `
                  <p class="text-xs text-slate-400 py-3 text-center">No upcoming bills due soon.</p>
                ` : metrics.upcomingRecurring.slice(0, 3).map(r => `
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p class="text-xs font-semibold text-slate-800">${SpendWise.Utils.sanitizeHTML(r.title)}</p>
                      <p class="text-[11px] text-slate-500 mt-0.5 flex items-center">
                        <span class="inline-block w-1.5 h-1.5 rounded-full ${r.daysLeft <= 3 ? 'bg-rose-500' : 'bg-amber-500'} mr-1.5"></span>
                        Due in ${r.daysLeft === 0 ? 'Today' : `${r.daysLeft} days`} (${SpendWise.Utils.formatDate(r.nextDueDate, 'short')})
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-slate-900">${SpendWise.Utils.formatCurrency(r.amount, currency)}</p>
                      <button class="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline" onclick="SpendWise.State.logRecurringPayment('${r.id}'); SpendWise.Toast.success('Logged recurring bill as paid!');">
                        Mark Paid
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Category Budget Progress -->
            <div class="premium-card p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-base font-bold text-slate-800">Top Category Budgets</h3>
                <button class="text-xs font-semibold text-emerald-700 hover:text-emerald-800" onclick="SpendWise.State.setView('categories')">
                  View All
                </button>
              </div>
              <div class="space-y-3.5">
                ${metrics.categoryBreakdown.filter(c => c.budget > 0).slice(0, 4).map(c => {
                  const pct = Math.min(100, Math.round(c.percentOfBudget));
                  const isOver = c.isOverBudget;
                  const barColor = isOver ? 'bg-rose-500' : (pct > 80 ? 'bg-amber-500' : 'bg-emerald-600');

                  return `
                    <div>
                      <div class="flex items-center justify-between text-xs mb-1">
                        <span class="font-medium text-slate-700 flex items-center">
                          <span class="w-2 h-2 rounded-full mr-1.5" style="background-color: ${c.color};"></span>
                          ${c.name}
                        </span>
                        <span class="text-slate-500 font-medium">
                          ${SpendWise.Utils.formatCurrency(c.spent, currency, false)} / ${SpendWise.Utils.formatCurrency(c.budget, currency, false)}
                        </span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div class="h-full rounded-full ${barColor}" style="width: ${pct}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;
    mainContainer.innerHTML = html;

    if (window.lucide) lucide.createIcons();

    // Event listeners for quick dashboard buttons
    document.getElementById('btn-dash-add-tx')?.addEventListener('click', () => {
      SpendWise.Modal.openTransactionModal();
    });

    document.getElementById('btn-dash-export')?.addEventListener('click', () => {
      const csv = SpendWise.Utils.transactionsToCSV(SpendWise.State.transactions, SpendWise.State.categories);
      SpendWise.Utils.downloadFile(`spendwise_transactions_${new Date().toISOString().split('T')[0]}.csv`, csv);
      SpendWise.Toast.success('Exported all transactions to CSV');
    });

    // Render interactive charts on canvas elements
    setTimeout(() => {
      SpendWise.Charts.renderIncomeVsExpensesChart('dash-chart-cashflow', 6);
      SpendWise.Charts.renderExpenseDistributionChart('dash-chart-doughnut');
    }, 50);
  }
};

