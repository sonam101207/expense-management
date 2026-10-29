/**
 * SpendWise — Recurring Payments Component
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Recurring = {
  render() {
    const currency = SpendWise.State.settings.currency || 'USD';
    const rules = SpendWise.State.recurring;
    const categories = SpendWise.State.categories;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalMonthly = rules
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => {
        if (r.frequency === 'yearly') return sum + r.amount / 12;
        if (r.frequency === 'weekly') return sum + r.amount * 4.33;
        if (r.frequency === 'daily') return sum + r.amount * 30;
        return sum + r.amount;
      }, 0);

    const enriched = rules.map(r => {
      const cat = categories.find(c => c.id === r.categoryId);
      const due = r.nextDueDate ? new Date(r.nextDueDate + 'T00:00:00') : null;
      const daysLeft = due ? Math.round((due - today) / (1000 * 60 * 60 * 24)) : null;
      return { ...r, cat, daysLeft };
    }).sort((a, b) => {
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    });

    const expenseRules = enriched.filter(r => r.type === 'expense');
    const incomeRules = enriched.filter(r => r.type === 'income');

    const html = `
      <div class="space-y-6 animate-fade-in">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Recurring Payments</h1>
            <p class="text-xs text-slate-500 mt-1">
              Manage subscriptions, bills, and regular income deposits
            </p>
          </div>
          <button id="btn-add-recurring" class="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-xl shadow-sm transition-all self-start sm:self-auto">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Recurring Rule</span>
          </button>
        </div>

        <!-- Summary Banner -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="premium-card p-5">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <i data-lucide="repeat" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-xs text-slate-400 font-medium">Total Monthly Bills</p>
                <p class="text-lg font-bold text-slate-900">${SpendWise.Utils.formatCurrency(totalMonthly, currency)}</p>
                <p class="text-[11px] text-slate-400">${expenseRules.length} active schedules</p>
              </div>
            </div>
          </div>
          <div class="premium-card p-5">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <i data-lucide="alert-circle" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-xs text-slate-400 font-medium">Due in Next 7 Days</p>
                <p class="text-lg font-bold text-slate-900">
                  ${expenseRules.filter(r => r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= 7).length} Bills
                </p>
                <p class="text-[11px] text-slate-400">
                  Total: ${SpendWise.Utils.formatCurrency(
                    expenseRules.filter(r => r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= 7).reduce((s, r) => s + r.amount, 0),
                    currency
                  )}
                </p>
              </div>
            </div>
          </div>
          <div class="premium-card p-5">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <i data-lucide="arrow-down-left" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-xs text-slate-400 font-medium">Recurring Income</p>
                <p class="text-lg font-bold text-slate-900">${incomeRules.length} Sources</p>
                <p class="text-[11px] text-slate-400">
                  ${SpendWise.Utils.formatCurrency(
                    incomeRules.reduce((s, r) => s + r.amount, 0),
                    currency
                  )}/mo estimated
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recurring Expense Rules -->
        <div class="premium-card overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800">Recurring Expenses & Subscriptions</h3>
            <span class="text-xs text-slate-400">${expenseRules.length} scheduled</span>
          </div>

          ${expenseRules.length === 0 ? `
            <div class="py-12 text-center px-4">
              <i data-lucide="calendar-off" class="w-8 h-8 mx-auto text-slate-300 mb-2"></i>
              <p class="text-sm font-semibold text-slate-600">No recurring expense rules yet</p>
              <p class="text-xs text-slate-400 mt-1">Add subscriptions, rent, utilities, or any regular payment.</p>
            </div>
          ` : `
            <div class="divide-y divide-slate-100">
              ${expenseRules.map(r => {
                const isOverdue = r.daysLeft !== null && r.daysLeft < 0;
                const isDueSoon = r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= 3;
                const isDueThisWeek = r.daysLeft !== null && r.daysLeft > 3 && r.daysLeft <= 7;

                let statusClass = 'bg-slate-100 text-slate-600';
                let statusText = r.daysLeft !== null ? `${r.daysLeft} days` : 'Unknown';
                if (isOverdue) { statusClass = 'bg-rose-100 text-rose-700'; statusText = 'Overdue'; }
                else if (r.daysLeft === 0) { statusClass = 'bg-rose-100 text-rose-700'; statusText = 'Due Today'; }
                else if (isDueSoon) { statusClass = 'bg-amber-100 text-amber-700'; statusText = `${r.daysLeft} days`; }
                else if (isDueThisWeek) { statusClass = 'bg-yellow-100 text-yellow-700'; statusText = `${r.daysLeft} days`; }

                const freqLabel = SpendWise.Config.RECURRING_FREQUENCIES.find(f => f.id === r.frequency)?.name || 'Monthly';

                return `
                  <div class="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div class="flex items-center space-x-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
                        <i data-lucide="${r.cat ? r.cat.icon : 'repeat'}" class="w-5 h-5"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-semibold text-slate-800 truncate">${SpendWise.Utils.sanitizeHTML(r.title)}</p>
                          <span class="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">${freqLabel}</span>
                        </div>
                        <div class="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          ${r.merchant ? `<span>${SpendWise.Utils.sanitizeHTML(r.merchant)}</span><span>&bull;</span>` : ''}
                          <span>${r.cat ? r.cat.name : 'Expense'}</span>
                          <span>&bull;</span>
                          <span>Next: ${r.nextDueDate ? SpendWise.Utils.formatDate(r.nextDueDate, 'medium') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center space-x-4 shrink-0 ml-4">
                      <div class="text-right">
                        <p class="text-sm font-bold text-slate-900">${SpendWise.Utils.formatCurrency(r.amount, currency)}</p>
                        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass}">${statusText}</span>
                      </div>
                      <div class="flex items-center space-x-1">
                        <button class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Log as Paid" onclick="SpendWise.Recurring.logPayment('${r.id}')">
                          <i data-lucide="check-circle" class="w-4 h-4"></i>
                        </button>
                        <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit" onclick="SpendWise.Modal.openRecurringModal('${r.id}')">
                          <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete" onclick="SpendWise.Recurring.confirmDelete('${r.id}')">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Recurring Income Rules -->
        <div class="premium-card overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800">Recurring Income Sources</h3>
            <span class="text-xs text-slate-400">${incomeRules.length} sources</span>
          </div>

          ${incomeRules.length === 0 ? `
            <div class="py-10 text-center px-4">
              <i data-lucide="wallet" class="w-7 h-7 mx-auto text-slate-300 mb-2"></i>
              <p class="text-sm text-slate-500">No recurring income sources added yet.</p>
            </div>
          ` : `
            <div class="divide-y divide-slate-100">
              ${incomeRules.map(r => {
                const freqLabel = SpendWise.Config.RECURRING_FREQUENCIES.find(f => f.id === r.frequency)?.name || 'Monthly';
                return `
                  <div class="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div class="flex items-center space-x-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <i data-lucide="${r.cat ? r.cat.icon : 'arrow-down-left'}" class="w-5 h-5"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center space-x-2">
                          <p class="text-sm font-semibold text-slate-800 truncate">${SpendWise.Utils.sanitizeHTML(r.title)}</p>
                          <span class="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">${freqLabel}</span>
                        </div>
                        <p class="text-[11px] text-slate-400 mt-0.5">
                          ${r.merchant ? SpendWise.Utils.sanitizeHTML(r.merchant) + ' &bull; ' : ''}
                          Next: ${r.nextDueDate ? SpendWise.Utils.formatDate(r.nextDueDate, 'medium') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4 shrink-0 ml-4">
                      <p class="text-sm font-bold text-emerald-600">+${SpendWise.Utils.formatCurrency(r.amount, currency)}</p>
                      <div class="flex items-center space-x-1">
                        <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" onclick="SpendWise.Modal.openRecurringModal('${r.id}')">
                          <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" onclick="SpendWise.Recurring.confirmDelete('${r.id}')">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    const mainContainer = document.getElementById('main-content-area');
    if (!mainContainer) return;
    mainContainer.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-add-recurring')?.addEventListener('click', () => {
      SpendWise.Modal.openRecurringModal();
    });
  },

  logPayment(ruleId) {
    const tx = SpendWise.State.logRecurringPayment(ruleId);
    if (tx) {
      SpendWise.Toast.success(`Logged "${tx.title}" as paid and advanced next due date.`);
    }
  },

  confirmDelete(ruleId) {
    const rule = SpendWise.State.recurring.find(r => r.id === ruleId);
    if (!rule) return;
    SpendWise.Modal.confirmDelete(
      'Remove Recurring Schedule',
      `Remove "${rule.title}" from your recurring schedules? This will not delete past logged transactions.`,
      () => {
        SpendWise.State.deleteRecurringRule(ruleId);
        SpendWise.Toast.success('Recurring schedule removed');
      }
    );
  }
};

