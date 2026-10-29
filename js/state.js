/**
 * SpendWise — Central Reactive State Management & Computed Analytics
 */
window.SpendWise = window.SpendWise || {};

SpendWise.State = {
  // Core application state
  currentView: 'dashboard',
  dateRangePreset: 'this_month',
  customStartDate: null,
  customEndDate: null,

  // Filters & sorting for transactions view
  searchQuery: '',
  filterType: 'all',          // 'all' | 'income' | 'expense'
  filterCategoryId: 'all',    // 'all' | category_id
  filterPaymentMethod: 'all', // 'all' | payment_method_id
  sortBy: 'date-desc',        // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'title-asc'
  currentPage: 1,
  itemsPerPage: 10,

  // Cache
  transactions: [],
  categories: [],
  recurring: [],
  settings: {},

  // Event subscribers
  listeners: [],

  /**
   * Initialize state from storage
   */
  init() {
    this.transactions = SpendWise.Storage.getTransactions();
    this.categories = SpendWise.Storage.getCategories();
    this.recurring = SpendWise.Storage.getRecurring();
    this.settings = SpendWise.Storage.getSettings();

    // Default custom date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    this.customStartDate = firstDay;
    this.customEndDate = lastDay;
  },

  /**
   * Subscribe to state change events
   * @param {Function} callback
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  },

  /**
   * Notify all registered listeners
   */
  notify(event, payload = {}) {
    this.listeners.forEach(cb => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    });
  },

  /**
   * Switch active view
   */
  setView(viewName) {
    if (this.currentView === viewName) return;
    this.currentView = viewName;
    this.notify('view_changed', { view: viewName });
  },

  /**
   * Change currency
   */
  setCurrency(currencyCode) {
    this.settings.currency = currencyCode;
    SpendWise.Storage.saveSettings(this.settings);
    this.notify('currency_changed', { currency: currencyCode });
  },

  /**
   * Update date range preset
   */
  setDateRangePreset(preset, customStart = null, customEnd = null) {
    this.dateRangePreset = preset;
    if (customStart) this.customStartDate = customStart;
    if (customEnd) this.customEndDate = customEnd;
    this.currentPage = 1;
    this.notify('date_range_changed', { preset, customStart, customEnd });
  },

  /**
   * Update transaction filters
   */
  setFilters({ search, type, categoryId, paymentMethod, sort, page, perPage }) {
    if (search !== undefined) this.searchQuery = search;
    if (type !== undefined) this.filterType = type;
    if (categoryId !== undefined) this.filterCategoryId = categoryId;
    if (paymentMethod !== undefined) this.filterPaymentMethod = paymentMethod;
    if (sort !== undefined) this.sortBy = sort;
    if (page !== undefined) this.currentPage = page;
    if (perPage !== undefined) this.itemsPerPage = perPage;

    this.notify('filters_changed');
  },

  // ================= TRANSACTION CRUD =================
  addTransaction(txData) {
    const newTx = {
      id: SpendWise.Utils.generateId('tx'),
      title: txData.title.trim(),
      amount: parseFloat(txData.amount),
      type: txData.type,
      categoryId: txData.categoryId,
      subcategory: txData.subcategory || '',
      date: txData.date,
      paymentMethod: txData.paymentMethod || 'credit_card',
      merchant: txData.merchant ? txData.merchant.trim() : '',
      isRecurring: Boolean(txData.isRecurring),
      notes: txData.notes ? txData.notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(newTx);
    SpendWise.Storage.saveTransactions(this.transactions);
    this.notify('transaction_added', { transaction: newTx });
    return newTx;
  },

  updateTransaction(id, updatedFields) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.transactions[index] = {
      ...this.transactions[index],
      ...updatedFields,
      amount: parseFloat(updatedFields.amount !== undefined ? updatedFields.amount : this.transactions[index].amount),
      updatedAt: new Date().toISOString()
    };

    SpendWise.Storage.saveTransactions(this.transactions);
    this.notify('transaction_updated', { transaction: this.transactions[index] });
    return this.transactions[index];
  },

  deleteTransaction(id) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    const [deleted] = this.transactions.splice(index, 1);
    SpendWise.Storage.saveTransactions(this.transactions);
    this.notify('transaction_deleted', { transaction: deleted });
    return true;
  },

  // ================= CATEGORY CRUD =================
  addCategory(categoryData) {
    const newCat = {
      id: SpendWise.Utils.generateId('cat'),
      name: categoryData.name.trim(),
      type: categoryData.type || 'expense',
      icon: categoryData.icon || 'tag',
      color: categoryData.color || '#10B981',
      budget: parseFloat(categoryData.budget || 0),
      subcategories: categoryData.subcategories || []
    };

    this.categories.push(newCat);
    SpendWise.Storage.saveCategories(this.categories);
    this.notify('category_added', { category: newCat });
    return newCat;
  },

  updateCategory(id, updatedFields) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.categories[index] = {
      ...this.categories[index],
      ...updatedFields,
      budget: parseFloat(updatedFields.budget !== undefined ? updatedFields.budget : this.categories[index].budget)
    };

    SpendWise.Storage.saveCategories(this.categories);
    this.notify('category_updated', { category: this.categories[index] });
    return this.categories[index];
  },

  deleteCategory(id) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    // Check if category is in use
    const inUse = this.transactions.some(t => t.categoryId === id);
    if (inUse) {
      // Reassign to other expense/income
      const fallbackId = this.categories[index].type === 'income' ? 'cat_other_inc' : 'cat_other_exp';
      this.transactions.forEach(t => {
        if (t.categoryId === id) t.categoryId = fallbackId;
      });
      SpendWise.Storage.saveTransactions(this.transactions);
    }

    const [deleted] = this.categories.splice(index, 1);
    SpendWise.Storage.saveCategories(this.categories);
    this.notify('category_deleted', { category: deleted });
    return true;
  },

  // ================= RECURRING RULES CRUD =================
  addRecurringRule(ruleData) {
    const newRule = {
      id: SpendWise.Utils.generateId('rec'),
      title: ruleData.title.trim(),
      amount: parseFloat(ruleData.amount),
      type: ruleData.type || 'expense',
      categoryId: ruleData.categoryId,
      subcategory: ruleData.subcategory || '',
      paymentMethod: ruleData.paymentMethod || 'credit_card',
      merchant: ruleData.merchant ? ruleData.merchant.trim() : '',
      frequency: ruleData.frequency || 'monthly',
      dayOfMonth: parseInt(ruleData.dayOfMonth || 1, 10),
      nextDueDate: ruleData.nextDueDate,
      notes: ruleData.notes || ''
    };

    this.recurring.push(newRule);
    SpendWise.Storage.saveRecurring(this.recurring);
    this.notify('recurring_added', { rule: newRule });
    return newRule;
  },

  updateRecurringRule(id, updatedFields) {
    const index = this.recurring.findIndex(r => r.id === id);
    if (index === -1) return null;

    this.recurring[index] = {
      ...this.recurring[index],
      ...updatedFields,
      amount: parseFloat(updatedFields.amount !== undefined ? updatedFields.amount : this.recurring[index].amount)
    };

    SpendWise.Storage.saveRecurring(this.recurring);
    this.notify('recurring_updated', { rule: this.recurring[index] });
    return this.recurring[index];
  },

  deleteRecurringRule(id) {
    const index = this.recurring.findIndex(r => r.id === id);
    if (index === -1) return false;

    const [deleted] = this.recurring.splice(index, 1);
    SpendWise.Storage.saveRecurring(this.recurring);
    this.notify('recurring_deleted', { rule: deleted });
    return true;
  },

  /**
   * Log payment for a recurring rule as a transaction
   */
  logRecurringPayment(ruleId) {
    const rule = this.recurring.find(r => r.id === ruleId);
    if (!rule) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const newTx = this.addTransaction({
      title: rule.title,
      amount: rule.amount,
      type: rule.type,
      categoryId: rule.categoryId,
      subcategory: rule.subcategory,
      date: todayStr,
      paymentMethod: rule.paymentMethod,
      merchant: rule.merchant,
      isRecurring: true,
      notes: `Recurring payment logged for ${todayStr}`
    });

    // Advance next due date by 1 month (or frequency)
    const nextD = new Date(rule.nextDueDate || todayStr);
    if (rule.frequency === 'monthly') {
      nextD.setMonth(nextD.getMonth() + 1);
    } else if (rule.frequency === 'yearly') {
      nextD.setFullYear(nextD.getFullYear() + 1);
    } else if (rule.frequency === 'weekly') {
      nextD.setDate(nextD.getDate() + 7);
    } else {
      nextD.setDate(nextD.getDate() + 1);
    }

    this.updateRecurringRule(ruleId, { nextDueDate: nextD.toISOString().split('T')[0] });
    return newTx;
  },

  // ================= COMPUTED ANALYTICS & METRICS =================

  /**
   * Get active period dates based on state
   */
  getActivePeriodDates() {
    return SpendWise.Utils.calculatePeriodDates(
      this.dateRangePreset,
      this.customStartDate,
      this.customEndDate
    );
  },

  /**
   * Filter transactions matching date range and optional criteria
   */
  getFilteredTransactions(includeDateFilter = true) {
    const { startDate, endDate } = this.getActivePeriodDates();
    let result = [...this.transactions];

    // 1. Date Range
    if (includeDateFilter && startDate && endDate) {
      result = result.filter(t => {
        const tDate = new Date(t.date + 'T00:00:00');
        return tDate >= startDate && tDate <= endDate;
      });
    }

    // 2. Type Filter
    if (this.filterType !== 'all') {
      result = result.filter(t => t.type === this.filterType);
    }

    // 3. Category Filter
    if (this.filterCategoryId !== 'all') {
      result = result.filter(t => t.categoryId === this.filterCategoryId);
    }

    // 4. Payment Method Filter
    if (this.filterPaymentMethod !== 'all') {
      result = result.filter(t => t.paymentMethod === this.filterPaymentMethod);
    }

    // 5. Search Query
    if (this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const merchantMatch = (t.merchant || '').toLowerCase().includes(q);
        const notesMatch = (t.notes || '').toLowerCase().includes(q);
        const cat = this.categories.find(c => c.id === t.categoryId);
        const catMatch = cat ? cat.name.toLowerCase().includes(q) : false;
        return titleMatch || merchantMatch || notesMatch || catMatch;
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  },

  /**
   * Compute comprehensive dashboard metrics for active period & comparison
   */
  getDashboardMetrics() {
    const { startDate, endDate, prevStartDate, prevEndDate, label } = this.getActivePeriodDates();

    // Current period transactions
    const currentPeriodTxs = this.transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    // Previous period transactions
    const prevPeriodTxs = this.transactions.filter(t => {
      if (!prevStartDate || !prevEndDate) return false;
      const d = new Date(t.date + 'T00:00:00');
      return d >= prevStartDate && d <= prevEndDate;
    });

    // Totals for current period
    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseCategoryMap = {};

    currentPeriodTxs.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        expenseCategoryMap[t.categoryId] = (expenseCategoryMap[t.categoryId] || 0) + t.amount;
      }
    });

    // Totals for previous period
    let prevTotalIncome = 0;
    let prevTotalExpenses = 0;
    const prevExpenseCategoryMap = {};

    prevPeriodTxs.forEach(t => {
      if (t.type === 'income') {
        prevTotalIncome += t.amount;
      } else {
        prevTotalExpenses += t.amount;
        prevExpenseCategoryMap[t.categoryId] = (prevExpenseCategoryMap[t.categoryId] || 0) + t.amount;
      }
    });

    // Savings & Rates
    const savingsAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

    // Period over period changes
    const incomeChangePercent = prevTotalIncome > 0
      ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100
      : (totalIncome > 0 ? 100 : 0);

    const expenseChangePercent = prevTotalExpenses > 0
      ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100
      : (totalExpenses > 0 ? 100 : 0);

    // Days in current period for daily spending average
    let daysCount = 30;
    if (startDate && endDate) {
      const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
      daysCount = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }
    const averageDailySpending = totalExpenses / daysCount;

    // Total monthly budget of all expense categories
    const totalBudget = this.categories
      .filter(c => c.type === 'expense')
      .reduce((sum, c) => sum + (c.budget || 0), 0);

    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    // Largest Expense Category
    let largestCategory = null;
    let maxExpense = 0;
    Object.keys(expenseCategoryMap).forEach(catId => {
      const amt = expenseCategoryMap[catId];
      if (amt > maxExpense) {
        maxExpense = amt;
        const catObj = this.categories.find(c => c.id === catId);
        largestCategory = {
          id: catId,
          name: catObj ? catObj.name : 'Unknown Category',
          icon: catObj ? catObj.icon : 'tag',
          color: catObj ? catObj.color : '#64748B',
          amount: amt,
          percentage: totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0
        };
      }
    });

    // Category breakdown list
    const categoryBreakdown = this.categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const spent = expenseCategoryMap[cat.id] || 0;
        const prevSpent = prevExpenseCategoryMap[cat.id] || 0;
        const budget = cat.budget || 0;
        const percentOfBudget = budget > 0 ? (spent / budget) * 100 : 0;
        const percentOfTotal = totalExpenses > 0 ? (spent / totalExpenses) * 100 : 0;
        const diffAmount = spent - prevSpent;
        const percentChange = prevSpent > 0 ? (diffAmount / prevSpent) * 100 : (spent > 0 ? 100 : 0);

        return {
          ...cat,
          spent,
          prevSpent,
          budget,
          remaining: Math.max(0, budget - spent),
          isOverBudget: spent > budget && budget > 0,
          overAmount: Math.max(0, spent - budget),
          percentOfBudget,
          percentOfTotal,
          diffAmount,
          percentChange
        };
      })
      .sort((a, b) => b.spent - a.spent);

    // Categories with largest increases compared to previous period
    const largestIncreases = [...categoryBreakdown]
      .filter(c => c.diffAmount > 0)
      .sort((a, b) => b.diffAmount - a.diffAmount)
      .slice(0, 3);

    // Financial Health Score Algorithm (0 to 100)
    // 1. Savings Rate: 40 points (target: >= 20%)
    const savingsScore = Math.min(40, Math.max(0, (savingsRate / 20) * 40));
    // 2. Budget Utilization: 40 points (optimal: 70-85%)
    let budgetScore = 40;
    if (budgetUtilization > 100) {
      budgetScore = Math.max(0, 40 - (budgetUtilization - 100) * 1.5);
    } else if (budgetUtilization > 85) {
      budgetScore = 32;
    }
    // 3. Positive Balance & Net Cash Flow: 20 points
    const cashFlowScore = totalIncome >= totalExpenses ? 20 : Math.max(0, 20 - ((totalExpenses - totalIncome) / (totalIncome || 1)) * 20);
    
    const healthScore = Math.round(savingsScore + budgetScore + cashFlowScore);
    let healthLabel = 'Excellent';
    let healthBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let healthAdvice = 'Outstanding financial discipline! You are saving a healthy portion of income.';

    if (healthScore < 50) {
      healthLabel = 'Needs Attention';
      healthBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
      healthAdvice = 'Expenses exceed your recommended threshold. Review variable expenses.';
    } else if (healthScore < 75) {
      healthLabel = 'Fair / Moderate';
      healthBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
      healthAdvice = 'Good foundation, but keep an eye on upcoming recurring commitments.';
    } else if (healthScore < 88) {
      healthLabel = 'Good';
      healthBadgeColor = 'text-teal-700 bg-teal-50 border-teal-200';
      healthAdvice = 'On track with your budget and building positive net balance.';
    }

    // Upcoming recurring payments (next 14 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourteenDaysLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const upcomingRecurring = this.recurring
      .filter(r => r.type === 'expense' && r.nextDueDate)
      .map(r => {
        const due = new Date(r.nextDueDate + 'T00:00:00');
        const daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24));
        const cat = this.categories.find(c => c.id === r.categoryId);
        return {
          ...r,
          daysLeft,
          categoryName: cat ? cat.name : 'Expense',
          categoryIcon: cat ? cat.icon : 'calendar'
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      periodLabel: label,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      savingsAmount,
      savingsRate,
      prevTotalIncome,
      prevTotalExpenses,
      incomeChangePercent,
      expenseChangePercent,
      totalBudget,
      budgetUtilization,
      averageDailySpending,
      largestCategory,
      categoryBreakdown,
      largestIncreases,
      healthScore,
      healthLabel,
      healthBadgeColor,
      healthAdvice,
      upcomingRecurring,
      transactionCount: currentPeriodTxs.length
    };
  }
};

