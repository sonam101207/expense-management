/**
 * SpendWise — Chart.js Management & Interactive Tracking Graphs
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Charts = {
  // Store Chart.js instances to properly destroy them upon updates
  instances: {},

  /**
   * Helper to safely destroy an existing chart instance
   */
  destroyChart(canvasId) {
    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
      delete this.instances[canvasId];
    }
  },

  /**
   * Common Chart.js styling options for a clean, light SaaS feel
   */
  getDefaultOptions(currencyCode = 'USD') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { family: 'Inter', size: 12, weight: '500' },
            color: '#475569',
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: '#0F172A',
          titleFont: { family: 'Inter', size: 12, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 10,
          cornerRadius: 8,
          boxPadding: 4,
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || context.label || '';
              const val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
              return ` ${label}: ${SpendWise.Utils.formatCurrency(val, currencyCode)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#64748B'
          }
        },
        y: {
          grid: { color: '#F1F5F9', drawBorder: false },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#64748B',
            callback: function (val) {
              return SpendWise.Utils.formatCurrency(val, currencyCode, false);
            }
          }
        }
      }
    };
  },

  // ================= 1. MONTHLY INCOME VS EXPENSES CHART =================
  renderIncomeVsExpensesChart(canvasId, monthCount = 6) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const transactions = SpendWise.State.transactions;
    const now = new Date();

    // Generate month buckets
    const months = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expense: 0
      });
    }

    // Populate data from transactions
    transactions.forEach(t => {
      const tDate = new Date(t.date + 'T00:00:00');
      const bucket = months.find(m => m.year === tDate.getFullYear() && m.month === tDate.getMonth());
      if (bucket) {
        if (t.type === 'income') {
          bucket.income += t.amount;
        } else {
          bucket.expense += t.amount;
        }
      }
    });

    const ctx = canvas.getContext('2d');
    const options = this.getDefaultOptions(currencyCode);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months.map(m => m.label),
        datasets: [
          {
            label: 'Income',
            data: months.map(m => m.income),
            backgroundColor: '#10B981', // Sage/Emerald
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.65
          },
          {
            label: 'Expenses',
            data: months.map(m => m.expense),
            backgroundColor: '#F43F5E', // Soft Rose
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.65
          }
        ]
      },
      options
    });
  },

  // ================= 2. DAILY SPENDING TREND CHART =================
  renderDailySpendingTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const { startDate, endDate } = SpendWise.State.getActivePeriodDates();
    const transactions = SpendWise.State.transactions;

    // Filter expenses in period
    const expenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date + 'T00:00:00');
      return (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    // Group by day
    const dayMap = {};
    // Seed days if range is within 31 days
    let cur = new Date(startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const end = new Date(endDate || new Date());
    
    // Prevent huge loops if all_time
    const diffDays = Math.min(60, Math.round((end - cur) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 45) {
      for (let i = 0; i <= diffDays; i++) {
        const dStr = cur.toISOString().split('T')[0];
        dayMap[dStr] = 0;
        cur.setDate(cur.getDate() + 1);
      }
    }

    expenses.forEach(t => {
      dayMap[t.date] = (dayMap[t.date] || 0) + t.amount;
    });

    const sortedDates = Object.keys(dayMap).sort();
    const labels = sortedDates.map(d => SpendWise.Utils.formatDate(d, 'short'));
    const amounts = sortedDates.map(d => dayMap[d]);

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(85, 139, 87, 0.25)'); // sage
    gradient.addColorStop(1, 'rgba(85, 139, 87, 0.01)');

    const options = this.getDefaultOptions(currencyCode);
    options.elements = { line: { tension: 0.35 } };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Daily Spending',
          data: amounts,
          borderColor: '#558B57', // Sage green
          backgroundColor: gradient,
          fill: true,
          pointRadius: amounts.length > 20 ? 2 : 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#558B57',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          borderWidth: 2.5
        }]
      },
      options
    });
  },

  // ================= 3. EXPENSE DISTRIBUTION DOUGHNUT CHART =================
  renderExpenseDistributionChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const metrics = SpendWise.State.getDashboardMetrics();
    const breakdown = metrics.categoryBreakdown.filter(c => c.spent > 0);

    const labels = breakdown.length > 0 ? breakdown.map(c => c.name) : ['No Expenses'];
    const data = breakdown.length > 0 ? breakdown.map(c => c.spent) : [1];
    const colors = breakdown.length > 0 ? breakdown.map(c => c.color || '#64748B') : ['#E2E8F0'];

    const ctx = canvas.getContext('2d');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter', size: 11, weight: '500' },
              color: '#475569',
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                if (breakdown.length === 0) return ' No expenses recorded';
                const val = context.parsed;
                const total = breakdown.reduce((sum, b) => sum + b.spent, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${SpendWise.Utils.formatCurrency(val, currencyCode)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  // ================= 4. CATEGORY-WISE SPENDING BAR CHART =================
  renderCategoryBarChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const metrics = SpendWise.State.getDashboardMetrics();
    const breakdown = metrics.categoryBreakdown.filter(c => c.spent > 0).slice(0, 8);

    const labels = breakdown.map(c => c.name);
    const amounts = breakdown.map(c => c.spent);
    const colors = breakdown.map(c => c.color || '#558B57');

    const ctx = canvas.getContext('2d');
    const options = this.getDefaultOptions(currencyCode);
    options.indexAxis = 'y'; // Horizontal bar chart
    options.scales.x.grid = { color: '#F1F5F9', drawBorder: false };
    options.scales.y.grid = { display: false, drawBorder: false };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Spent',
          data: amounts,
          backgroundColor: colors,
          borderRadius: 6,
          barPercentage: 0.65
        }]
      },
      options
    });
  },

  // ================= 5. SAVINGS AND BALANCE TREND OVER TIME =================
  renderSavingsTrendChart(canvasId, monthCount = 6) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const transactions = SpendWise.State.transactions;
    const now = new Date();

    const months = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expense: 0,
        savings: 0,
        cumulativeBalance: 0
      });
    }

    transactions.forEach(t => {
      const tDate = new Date(t.date + 'T00:00:00');
      const b = months.find(m => m.year === tDate.getFullYear() && m.month === tDate.getMonth());
      if (b) {
        if (t.type === 'income') b.income += t.amount;
        else b.expense += t.amount;
      }
    });

    let runningBalance = 0;
    months.forEach(m => {
      m.savings = m.income - m.expense;
      runningBalance += m.savings;
      m.cumulativeBalance = runningBalance;
    });

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(15, 118, 110, 0.25)'); // teal
    gradient.addColorStop(1, 'rgba(15, 118, 110, 0.01)');

    const options = this.getDefaultOptions(currencyCode);
    options.elements = { line: { tension: 0.3 } };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months.map(m => m.label),
        datasets: [
          {
            label: 'Monthly Net Savings',
            data: months.map(m => m.savings),
            borderColor: '#0D9488', // Teal
            backgroundColor: gradient,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#0D9488'
          },
          {
            label: 'Cumulative Net Worth Trend',
            data: months.map(m => m.cumulativeBalance),
            borderColor: '#3B82F6', // Blue
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#3B82F6'
          }
        ]
      },
      options
    });
  },

  // ================= 6. BUDGET VERSUS ACTUAL SPENDING CHART =================
  renderBudgetComparisonChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const metrics = SpendWise.State.getDashboardMetrics();
    const categoriesWithBudget = metrics.categoryBreakdown.filter(c => c.budget > 0 || c.spent > 0).slice(0, 7);

    const labels = categoriesWithBudget.map(c => c.name);
    const budgets = categoriesWithBudget.map(c => c.budget);
    const actuals = categoriesWithBudget.map(c => c.spent);

    const ctx = canvas.getContext('2d');
    const options = this.getDefaultOptions(currencyCode);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Budget Limit',
            data: budgets,
            backgroundColor: '#CBD5E1', // Soft slate
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.7
          },
          {
            label: 'Actual Spent',
            data: actuals,
            backgroundColor: '#558B57', // Sage green
            borderRadius: 6,
            barPercentage: 0.65,
            categoryPercentage: 0.7
          }
        ]
      },
      options
    });
  },

  // ================= 7. MONTHLY SAVINGS-RATE TREND CHART =================
  renderSavingsRateTrendChart(canvasId, monthCount = 6) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const transactions = SpendWise.State.transactions;
    const now = new Date();

    const months = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expense: 0
      });
    }

    transactions.forEach(t => {
      const tDate = new Date(t.date + 'T00:00:00');
      const b = months.find(m => m.year === tDate.getFullYear() && m.month === tDate.getMonth());
      if (b) {
        if (t.type === 'income') b.income += t.amount;
        else b.expense += t.amount;
      }
    });

    const rates = months.map(m => {
      if (m.income <= 0) return 0;
      const rate = ((m.income - m.expense) / m.income) * 100;
      return Math.round(rate * 10) / 10;
    });

    const ctx = canvas.getContext('2d');
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { family: 'Inter', size: 12, weight: '500' },
            color: '#475569',
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#0F172A',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return ` ${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: function (val) {
              return `${val}%`;
            }
          }
        }
      }
    };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months.map(m => m.label),
        datasets: [
          {
            label: 'Actual Savings Rate (%)',
            data: rates,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#10B981'
          },
          {
            label: 'Target Benchmark (20%)',
            data: months.map(() => 20),
            borderColor: '#94A3B8',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options
    });
  },

  // ================= 8. CURRENT VS PREVIOUS MONTH COMPARISON CHART =================
  renderMonthComparisonChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.destroyChart(canvasId);

    const currencyCode = SpendWise.State.settings.currency || 'USD';
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const prevDate = new Date(curYear, curMonth - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    // Map days 1 to 31
    const curDays = new Date(curYear, curMonth + 1, 0).getDate();
    const prevDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    const maxDays = Math.max(curDays, prevDays);

    const labels = [];
    const currentDayExpenses = Array(maxDays).fill(0);
    const previousDayExpenses = Array(maxDays).fill(0);

    for (let day = 1; day <= maxDays; day++) {
      labels.push(`Day ${day}`);
    }

    const txs = SpendWise.State.transactions;
    txs.forEach(t => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date + 'T00:00:00');
      const dayIdx = d.getDate() - 1;

      if (d.getFullYear() === curYear && d.getMonth() === curMonth) {
        currentDayExpenses[dayIdx] += t.amount;
      } else if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) {
        previousDayExpenses[dayIdx] += t.amount;
      }
    });

    // Compute cumulative spending trajectory
    const currentCumulative = [];
    let curRunning = 0;
    const todayDay = now.getDate();

    for (let i = 0; i < maxDays; i++) {
      if (i < todayDay) {
        curRunning += currentDayExpenses[i];
        currentCumulative.push(curRunning);
      } else {
        currentCumulative.push(null); // Don't project future days
      }
    }

    const previousCumulative = [];
    let prevRunning = 0;
    for (let i = 0; i < maxDays; i++) {
      prevRunning += previousDayExpenses[i];
      previousCumulative.push(prevRunning);
    }

    const ctx = canvas.getContext('2d');
    const options = this.getDefaultOptions(currencyCode);
    options.elements = { line: { tension: 0.25 } };

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Month (Cumulative)',
            data: currentCumulative,
            borderColor: '#558B57', // Sage green
            backgroundColor: 'rgba(85, 139, 87, 0.08)',
            fill: true,
            borderWidth: 2.5,
            pointRadius: 2,
            pointBackgroundColor: '#558B57'
          },
          {
            label: 'Previous Month (Full)',
            data: previousCumulative,
            borderColor: '#94A3B8', // Muted slate
            borderDash: [4, 4],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options
    });
  }
};

