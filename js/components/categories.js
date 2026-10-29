/**
 * SpendWise — Categories & Budgets Component
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Categories = {
  render() {
    const metrics = SpendWise.State.getDashboardMetrics();
    const currency = SpendWise.State.settings.currency || 'USD';
    const categories = SpendWise.State.categories.filter(c => c.type === 'expense');

    // Total Budget vs Spent stats
    const totalBudget = metrics.totalBudget;
    const totalSpent = metrics.totalExpenses;
    const totalRemaining = Math.max(0, totalBudget - totalSpent);
    const overallUtilization = metrics.budgetUtilization;

    // Over budget categories count
    const overBudgetCats = metrics.categoryBreakdown.filter(c => c.isOverBudget);

    const html = `
      <div class="space-y-6 animate-fade-in">
        <!-- Top Header & Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Categories & Budgets</h1>
            <p class="text-xs text-slate-500 mt-1">
              Track monthly spending limits, monitor category utilization, and manage expense categories.
            </p>
          </div>

          <button id="btn-add-category" class="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-sm transition-all self-start sm:self-auto">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Custom Category</span>
          </button>
        </div>

        <!-- Budget Summary Banner -->
        <div class="premium-card p-6 bg-gradient-to-r from-white via-slate-50/50 to-emerald-50/20">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Budget</span>
              <p class="text-2xl font-bold text-slate-900 mt-1">
                ${SpendWise.Utils.formatCurrency(totalBudget, currency, false)}
              </p>
              <p class="text-[11px] text-slate-400 mt-0.5">Across ${categories.length} expense categories</p>
            </div>

            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actual Spent This Period</span>
              <p class="text-2xl font-bold text-slate-900 mt-1">
                ${SpendWise.Utils.formatCurrency(totalSpent, currency)}
              </p>
              <p class="text-[11px] text-slate-400 mt-0.5">
                ${SpendWise.Utils.formatPercentage(overallUtilization)} of budget utilized
              </p>
            </div>

            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Buffer</span>
              <p class="text-2xl font-bold ${totalRemaining > 0 ? 'text-emerald-700' : 'text-rose-600'} mt-1">
                ${SpendWise.Utils.formatCurrency(totalRemaining, currency)}
              </p>
              <p class="text-[11px] text-slate-400 mt-0.5">
                ${overBudgetCats.length > 0 ? `<span class="text-rose-600 font-semibold">${overBudgetCats.length} categories over limit</span>` : 'All categories within limits'}
              </p>
            </div>

            <div class="flex flex-col justify-center">
              <div class="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span class="text-slate-600">Overall Budget Adherence</span>
                <span class="font-bold text-slate-800">${SpendWise.Utils.formatPercentage(overallUtilization)}</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500 ${overallUtilization > 100 ? 'bg-rose-500' : (overallUtilization > 85 ? 'bg-amber-500' : 'bg-emerald-600')}" style="width: ${Math.min(100, overallUtilization)}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Month-over-Month Category Trends & Largest Increases -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Largest Increases Alert Card -->
          <div class="premium-card p-6">
            <div class="flex items-center space-x-2 text-rose-600 mb-3">
              <i data-lucide="trending-up" class="w-5 h-5"></i>
              <h3 class="text-sm font-bold text-slate-800">Largest Spending Increases</h3>
            </div>
            <p class="text-xs text-slate-500 mb-4">Categories that rose highest compared to the previous period:</p>
            
            <div class="space-y-3">
              ${metrics.largestIncreases.length === 0 ? `
                <p class="text-xs text-slate-400 py-3 text-center">No categories saw spending increases!</p>
              ` : metrics.largestIncreases.map(inc => `
                <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="flex items-center space-x-2.5 min-w-0">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="background-color: ${inc.color}15; color: ${inc.color};">
                      <i data-lucide="${inc.icon}" class="w-4 h-4"></i>
                    </div>
                    <span class="text-xs font-semibold text-slate-800 truncate">${inc.name}</span>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-xs font-bold text-rose-600">+${SpendWise.Utils.formatCurrency(inc.diffAmount, currency)}</span>
                    <span class="text-[10px] text-slate-400 block">+${inc.percentChange.toFixed(0)}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Category Spending Bar Chart -->
          <div class="premium-card p-6 lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-slate-800">Category Spending Comparison</h3>
                <p class="text-xs text-slate-500">Ranked by actual expenditure for ${metrics.periodLabel}</p>
              </div>
            </div>
            <div class="h-56 chart-container">
              <canvas id="categories-chart-bar"></canvas>
            </div>
          </div>
        </div>

        <!-- All Category Cards Grid -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800">All Expense Categories</h3>
            <span class="text-xs text-slate-400">Click any category to edit its monthly budget</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${metrics.categoryBreakdown.map(cat => {
              const spent = cat.spent;
              const budget = cat.budget;
              const pctOfBudget = Math.round(cat.percentOfBudget);
              const pctOfTotal = cat.percentOfTotal;
              const isOver = cat.isOverBudget;

              let barClass = 'bg-emerald-600';
              if (isOver) barClass = 'bg-rose-500';
              else if (pctOfBudget > 80) barClass = 'bg-amber-500';

              return `
                <div class="premium-card p-5 hover:border-slate-300 transition-all flex flex-col justify-between group">
                  <div>
                    <!-- Top row: Icon, Name, Share pill & Edit button -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${cat.color}18; color: ${cat.color};">
                          <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
                        </div>
                        <div>
                          <h4 class="text-sm font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">${cat.name}</h4>
                          <span class="text-[11px] text-slate-400">${pctOfTotal.toFixed(1)}% of all expenses</span>
                        </div>
                      </div>

                      <div class="flex items-center space-x-1">
                        <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit Category & Budget" onclick="SpendWise.Modal.openCategoryModal('${cat.id}')">
                          <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Category" onclick="SpendWise.Categories.confirmDeleteCategory('${cat.id}')">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Amounts row -->
                    <div class="mt-4 flex items-baseline justify-between">
                      <div>
                        <span class="text-xs text-slate-400">Spent:</span>
                        <p class="text-lg font-bold text-slate-900">${SpendWise.Utils.formatCurrency(spent, currency)}</p>
                      </div>
                      <div class="text-right">
                        <span class="text-xs text-slate-400">Budget:</span>
                        <p class="text-sm font-semibold text-slate-600">${budget > 0 ? SpendWise.Utils.formatCurrency(budget, currency, false) : 'No limit'}</p>
                      </div>
                    </div>

                    <!-- Progress bar if budget > 0 -->
                    ${budget > 0 ? `
                      <div class="mt-3">
                        <div class="flex items-center justify-between text-[11px] mb-1 font-medium">
                          <span class="${isOver ? 'text-rose-600 font-bold' : 'text-slate-500'}">
                            ${isOver ? `Over budget by ${SpendWise.Utils.formatCurrency(cat.overAmount, currency)}` : `${SpendWise.Utils.formatCurrency(cat.remaining, currency)} remaining`}
                          </span>
                          <span class="${isOver ? 'text-rose-600 font-bold' : 'text-slate-700'}">${pctOfBudget}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div class="h-full rounded-full transition-all duration-500 ${barClass}" style="width: ${Math.min(100, pctOfBudget)}%;"></div>
                        </div>
                      </div>
                    ` : `
                      <div class="mt-3 py-1">
                        <span class="text-[11px] text-slate-400 italic">No budget set &bull; Tracking uncapped</span>
                      </div>
                    `}
                  </div>

                  <!-- Month-over-Month pill -->
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span class="text-slate-400">MoM Change:</span>
                    <span class="font-medium flex items-center ${cat.diffAmount > 0 ? 'text-rose-600' : (cat.diffAmount < 0 ? 'text-emerald-600' : 'text-slate-500')}">
                      <i data-lucide="${cat.diffAmount > 0 ? 'trending-up' : (cat.diffAmount < 0 ? 'trending-down' : 'minus')}" class="w-3 h-3 mr-1"></i>
                      ${cat.diffAmount !== 0 ? SpendWise.Utils.formatCurrency(Math.abs(cat.diffAmount), currency) : '$0'} (${cat.percentChange.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Month-over-Month Comparison Breakdown Table -->
        <div class="premium-card p-6">
          <div class="mb-4">
            <h3 class="text-base font-bold text-slate-800">Month-over-Month Detailed Breakdown</h3>
            <p class="text-xs text-slate-500">Comprehensive comparison between current and previous month spending</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4 text-right">This Period</th>
                  <th class="py-3 px-4 text-right">Prior Period</th>
                  <th class="py-3 px-4 text-right">Difference</th>
                  <th class="py-3 px-4 text-right">% Change</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${metrics.categoryBreakdown.map(cat => {
                  const isUp = cat.diffAmount > 0;
                  const isDown = cat.diffAmount < 0;

                  return `
                    <tr class="table-row-hover">
                      <td class="py-3 px-4 font-semibold text-slate-800 flex items-center space-x-2">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${cat.color};"></span>
                        <span>${cat.name}</span>
                      </td>
                      <td class="py-3 px-4 text-right font-medium text-slate-800">
                        ${SpendWise.Utils.formatCurrency(cat.spent, currency)}
                      </td>
                      <td class="py-3 px-4 text-right text-slate-500">
                        ${SpendWise.Utils.formatCurrency(cat.prevSpent, currency)}
                      </td>
                      <td class="py-3 px-4 text-right font-semibold ${isUp ? 'text-rose-600' : (isDown ? 'text-emerald-600' : 'text-slate-500')}">
                        ${isUp ? '+' : (isDown ? '-' : '')}${SpendWise.Utils.formatCurrency(Math.abs(cat.diffAmount), currency)}
                      </td>
                      <td class="py-3 px-4 text-right font-medium ${isUp ? 'text-rose-600' : (isDown ? 'text-emerald-600' : 'text-slate-500')}">
                        ${SpendWise.Utils.formatPercentage(cat.percentChange, true)}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.isOverBudget ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                          ${cat.isOverBudget ? 'Over Budget' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;
    mainContainer.innerHTML = html;

    if (window.lucide) lucide.createIcons();

    // Event listener to add category
    document.getElementById('btn-add-category')?.addEventListener('click', () => {
      SpendWise.Modal.openCategoryModal();
    });

    // Render bar chart
    setTimeout(() => {
      SpendWise.Charts.renderCategoryBarChart('categories-chart-bar');
    }, 50);
  },

  confirmDeleteCategory(catId) {
    const cat = SpendWise.State.categories.find(c => c.id === catId);
    if (!cat) return;

    SpendWise.Modal.confirmDelete(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Transactions assigned to this category will be preserved and reassigned to "Other Expense".`,
      () => {
        SpendWise.State.deleteCategory(catId);
        SpendWise.Toast.success(`Category "${cat.name}" deleted`);
      }
    );
  }
};

