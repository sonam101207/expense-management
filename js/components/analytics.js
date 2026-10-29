/**
 * SpendWise — Analytics & Charts Component
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Analytics = {
  render() {
    const metrics = SpendWise.State.getDashboardMetrics();
    const currency = SpendWise.State.settings.currency || 'USD';

    const html = `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Insights</h1>
          <p class="text-xs text-slate-500 mt-1">
            Interactive charts and deep-dive financial metrics for ${metrics.periodLabel}
          </p>
        </div>

        <!-- Key Insight Summary Pills -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="premium-card-flat p-4 text-center bg-white">
            <p class="text-xs text-slate-400 font-medium">Net Balance</p>
            <p class="text-xl font-bold mt-1 ${metrics.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
              ${SpendWise.Utils.formatCurrency(metrics.netBalance, currency)}
            </p>
          </div>
          <div class="premium-card-flat p-4 text-center bg-white">
            <p class="text-xs text-slate-400 font-medium">Savings Rate</p>
            <p class="text-xl font-bold mt-1 text-teal-700">
              ${SpendWise.Utils.formatPercentage(metrics.savingsRate)}
            </p>
          </div>
          <div class="premium-card-flat p-4 text-center bg-white">
            <p class="text-xs text-slate-400 font-medium">Expense Change</p>
            <p class="text-xl font-bold mt-1 ${metrics.expenseChangePercent > 0 ? 'text-rose-600' : 'text-emerald-600'}">
              ${SpendWise.Utils.formatPercentage(metrics.expenseChangePercent, true)}
            </p>
          </div>
          <div class="premium-card-flat p-4 text-center bg-white">
            <p class="text-xs text-slate-400 font-medium">Health Score</p>
            <p class="text-xl font-bold mt-1 text-slate-900">${metrics.healthScore}<span class="text-sm text-slate-400">/100</span></p>
          </div>
        </div>

        <!-- Row 1: Income vs Expenses + Daily Spending Trend -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Monthly Cash Flow</h3>
              <p class="text-xs text-slate-500">6-month income vs expense comparison</p>
            </div>
            <div class="h-60 chart-container">
              <canvas id="analytics-cashflow"></canvas>
            </div>
          </div>

          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Daily Spending Trend</h3>
              <p class="text-xs text-slate-500">Day-by-day expense pattern for the selected period</p>
            </div>
            <div class="h-60 chart-container">
              <canvas id="analytics-daily"></canvas>
            </div>
          </div>
        </div>

        <!-- Row 2: Doughnut + Category Bar -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Expense Distribution</h3>
              <p class="text-xs text-slate-500">Proportional share by category</p>
            </div>
            <div class="h-64 chart-container">
              <canvas id="analytics-doughnut"></canvas>
            </div>
          </div>

          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Top Categories by Spend</h3>
              <p class="text-xs text-slate-500">Ranked spending for the selected period</p>
            </div>
            <div class="h-64 chart-container">
              <canvas id="analytics-category-bar"></canvas>
            </div>
          </div>
        </div>

        <!-- Row 3: Savings Trend + Budget vs Actual -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Savings & Balance Trend</h3>
              <p class="text-xs text-slate-500">Monthly savings and cumulative balance over 6 months</p>
            </div>
            <div class="h-60 chart-container">
              <canvas id="analytics-savings"></canvas>
            </div>
          </div>

          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Budget vs. Actual</h3>
              <p class="text-xs text-slate-500">How actual spending compares to set category limits</p>
            </div>
            <div class="h-60 chart-container">
              <canvas id="analytics-budget"></canvas>
            </div>
          </div>
        </div>

        <!-- Row 4: Savings Rate Trend + Current vs Previous Month -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Monthly Savings Rate</h3>
              <p class="text-xs text-slate-500">Savings % trend with 20% benchmark target</p>
            </div>
            <div class="h-60 chart-container">
              <canvas id="analytics-savings-rate"></canvas>
            </div>
          </div>

          <div class="premium-card p-6">
            <div class="mb-4">
              <h3 class="text-base font-bold text-slate-800">Month Spending Comparison</h3>
              <p class="text-xs text-slate-500">Cumulative daily spend: current vs previous month</p>
            </div>
            <div class="h-60 chart-container">
              <canvas id="analytics-month-compare"></canvas>
            </div>
          </div>
        </div>

        <!-- Financial Health Breakdown Card -->
        <div class="premium-card p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-base font-bold text-slate-800">Monthly Financial Health Summary</h3>
              <p class="text-xs text-slate-500">Composite score based on savings rate, budget adherence, and cash flow</p>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-3xl font-extrabold text-slate-900">${metrics.healthScore}</span>
              <div>
                <span class="block text-xs font-semibold px-3 py-1 rounded-full border ${metrics.healthBadgeColor}">
                  ${metrics.healthLabel}
                </span>
                <span class="text-[10px] text-slate-400 mt-0.5 block text-center">out of 100</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Savings Rate Score -->
            <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-emerald-800">Savings Rate</span>
                <span class="text-xs font-bold text-emerald-700">${SpendWise.Utils.formatPercentage(metrics.savingsRate)}</span>
              </div>
              <div class="w-full bg-white rounded-full h-2 overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" style="width: ${Math.min(100, metrics.savingsRate / 20 * 100)}%;"></div>
              </div>
              <p class="text-[11px] text-emerald-700 mt-1.5">Target: ≥ 20% &bull; Contributes 40pts</p>
            </div>

            <!-- Budget Adherence Score -->
            <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-blue-800">Budget Adherence</span>
                <span class="text-xs font-bold text-blue-700">${SpendWise.Utils.formatPercentage(metrics.budgetUtilization)} used</span>
              </div>
              <div class="w-full bg-white rounded-full h-2 overflow-hidden">
                <div class="h-full ${metrics.budgetUtilization > 100 ? 'bg-rose-500' : 'bg-blue-500'} rounded-full" style="width: ${Math.min(100, metrics.budgetUtilization)}%;"></div>
              </div>
              <p class="text-[11px] text-blue-700 mt-1.5">Optimal: 70–85% &bull; Contributes 40pts</p>
            </div>

            <!-- Cash Flow Score -->
            <div class="p-4 rounded-xl bg-teal-50/70 border border-teal-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-teal-800">Positive Cash Flow</span>
                <span class="text-xs font-bold text-teal-700">${metrics.netBalance >= 0 ? 'Positive' : 'Negative'}</span>
              </div>
              <div class="w-full bg-white rounded-full h-2 overflow-hidden">
                <div class="h-full ${metrics.netBalance >= 0 ? 'bg-teal-500' : 'bg-rose-500'} rounded-full" style="width: ${metrics.netBalance >= 0 ? 100 : 30}%;"></div>
              </div>
              <p class="text-[11px] text-teal-700 mt-1.5">Income vs expenses &bull; Contributes 20pts</p>
            </div>
          </div>

          <div class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="flex items-start space-x-2">
              <i data-lucide="lightbulb" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5"></i>
              <p class="text-xs text-slate-700">${metrics.healthAdvice}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;
    mainContainer.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Render all 8 charts
    setTimeout(() => {
      SpendWise.Charts.renderIncomeVsExpensesChart('analytics-cashflow', 6);
      SpendWise.Charts.renderDailySpendingTrendChart('analytics-daily');
      SpendWise.Charts.renderExpenseDistributionChart('analytics-doughnut');
      SpendWise.Charts.renderCategoryBarChart('analytics-category-bar');
      SpendWise.Charts.renderSavingsTrendChart('analytics-savings', 6);
      SpendWise.Charts.renderBudgetComparisonChart('analytics-budget');
      SpendWise.Charts.renderSavingsRateTrendChart('analytics-savings-rate', 6);
      SpendWise.Charts.renderMonthComparisonChart('analytics-month-compare');
    }, 60);
  }
};

