/**
 * SpendWise — LocalStorage Manager & Demo Data Generator
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Storage = {
  /**
   * Check if localStorage is available
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('LocalStorage is not available, falling back to in-memory storage');
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
      return false;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
      return false;
    }
  },

  // Transactions
  getTransactions() {
    return this.getItem(SpendWise.Config.STORAGE_KEYS.TRANSACTIONS, []);
  },

  saveTransactions(transactions) {
    return this.setItem(SpendWise.Config.STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  // Categories
  getCategories() {
    const stored = this.getItem(SpendWise.Config.STORAGE_KEYS.CATEGORIES);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.saveCategories(SpendWise.Config.DEFAULT_CATEGORIES);
      return SpendWise.Config.DEFAULT_CATEGORIES;
    }
    return stored;
  },

  saveCategories(categories) {
    return this.setItem(SpendWise.Config.STORAGE_KEYS.CATEGORIES, categories);
  },

  // Recurring Rules
  getRecurring() {
    return this.getItem(SpendWise.Config.STORAGE_KEYS.RECURRING, []);
  },

  saveRecurring(recurring) {
    return this.setItem(SpendWise.Config.STORAGE_KEYS.RECURRING, recurring);
  },

  // Settings
  getSettings() {
    const defaults = {
      currency: SpendWise.Config.DEFAULT_CURRENCY,
      userName: 'Alex Morgan',
      monthlyBudgetGoal: 4200,
      hasSeenIntro: true
    };
    return { ...defaults, ...this.getItem(SpendWise.Config.STORAGE_KEYS.SETTINGS, {}) };
  },

  saveSettings(settings) {
    return this.setItem(SpendWise.Config.STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Generates realistic demo data relative to the current live date
   */
  generateDemoData() {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth(); // 0-indexed
    const curDay = today.getDate();

    // Helper to format ISO YYYY-MM-DD
    const makeDate = (year, month, day) => {
      const d = new Date(year, month, day);
      return d.toISOString().split('T')[0];
    };

    // Predefined recurring rules
    const recurringRules = [
      {
        id: 'rec_rent',
        title: 'Apartment Lease',
        amount: 1450.00,
        type: 'expense',
        categoryId: 'cat_housing',
        subcategory: 'Rent/Mortgage',
        paymentMethod: 'bank_transfer',
        merchant: 'Skyline Properties',
        frequency: 'monthly',
        dayOfMonth: 1,
        nextDueDate: makeDate(curYear, curMonth + (curDay > 1 ? 1 : 0), 1),
        notes: 'Monthly apartment rent transfer'
      },
      {
        id: 'rec_salary',
        title: 'Bi-Weekly Payroll Direct Deposit',
        amount: 2750.00,
        type: 'income',
        categoryId: 'cat_salary',
        subcategory: 'Base Salary',
        paymentMethod: 'bank_transfer',
        merchant: 'Veloce Labs Inc.',
        frequency: 'monthly',
        dayOfMonth: 15,
        nextDueDate: makeDate(curYear, curMonth + (curDay > 15 ? 1 : 0), 15),
        notes: 'Company payroll direct deposit'
      },
      {
        id: 'rec_netflix',
        title: 'Netflix 4K Ultra Subscription',
        amount: 22.99,
        type: 'expense',
        categoryId: 'cat_subscriptions',
        subcategory: 'Streaming (Netflix/Spotify)',
        paymentMethod: 'credit_card',
        merchant: 'Netflix Inc',
        frequency: 'monthly',
        dayOfMonth: 12,
        nextDueDate: makeDate(curYear, curMonth + (curDay > 12 ? 1 : 0), 12),
        notes: 'Family 4-stream plan'
      },
      {
        id: 'rec_spotify',
        title: 'Spotify Duo Subscription',
        amount: 14.99,
        type: 'expense',
        categoryId: 'cat_subscriptions',
        subcategory: 'Streaming (Netflix/Spotify)',
        paymentMethod: 'credit_card',
        merchant: 'Spotify AB',
        frequency: 'monthly',
        dayOfMonth: 18,
        nextDueDate: makeDate(curYear, curMonth + (curDay > 18 ? 1 : 0), 18),
        notes: 'Monthly music streaming'
      },
      {
        id: 'rec_gym',
        title: 'Equinox Fitness Club',
        amount: 65.00,
        type: 'expense',
        categoryId: 'cat_health',
        subcategory: 'Gym Membership',
        paymentMethod: 'debit_card',
        merchant: 'Equinox Gym',
        frequency: 'monthly',
        dayOfMonth: 8,
        nextDueDate: makeDate(curYear, curMonth + (curDay > 8 ? 1 : 0), 8),
        notes: 'Full access gym & pool pass'
      },
      {
        id: 'rec_internet',
        title: 'Sonic Gigabit Fiber Internet',
        amount: 70.00,
        type: 'expense',
        categoryId: 'cat_utilities',
        subcategory: 'Internet / WiFi',
        paymentMethod: 'credit_card',
        merchant: 'Sonic Fiber',
        frequency: 'monthly',
        dayOfMonth: 22,
        nextDueDate: makeDate(curYear, curMonth + (curDay > 22 ? 1 : 0), 22),
        notes: 'Home office fiber connection'
      }
    ];

    const transactions = [];

    // Generator function for standard month transactions
    const generateMonthTransactions = (year, month, maxDay) => {
      const txs = [
        // Incomes
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, 1),
          title: 'Direct Deposit — Bi-Weekly Payroll',
          amount: 2750.00,
          type: 'income',
          categoryId: 'cat_salary',
          subcategory: 'Base Salary',
          paymentMethod: 'bank_transfer',
          merchant: 'Veloce Labs Inc.',
          isRecurring: true,
          notes: 'Standard payroll'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(15, maxDay)),
          title: 'Direct Deposit — Bi-Weekly Payroll',
          amount: 2750.00,
          type: 'income',
          categoryId: 'cat_salary',
          subcategory: 'Base Salary',
          paymentMethod: 'bank_transfer',
          merchant: 'Veloce Labs Inc.',
          isRecurring: true,
          notes: 'Standard payroll mid-month'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(22, maxDay)),
          title: 'UI Design System Consulting',
          amount: 850.00,
          type: 'income',
          categoryId: 'cat_freelance',
          subcategory: 'Client Projects',
          paymentMethod: 'bank_transfer',
          merchant: 'Apex Studio Ltd',
          isRecurring: false,
          notes: 'Frontend design tokens deliverable'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(10, maxDay)),
          title: 'Vanguard Total Stock Dividend',
          amount: 142.50,
          type: 'income',
          categoryId: 'cat_investments',
          subcategory: 'Stock Dividends',
          paymentMethod: 'bank_transfer',
          merchant: 'Vanguard Brokerage',
          isRecurring: false,
          notes: 'Quarterly reinvested dividend'
        },

        // Fixed Expenses
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, 1),
          title: 'Monthly Apartment Lease Rent',
          amount: 1450.00,
          type: 'expense',
          categoryId: 'cat_housing',
          subcategory: 'Rent/Mortgage',
          paymentMethod: 'bank_transfer',
          merchant: 'Skyline Properties',
          isRecurring: true,
          notes: 'Auto-debit payment'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(5, maxDay)),
          title: 'Electric & Gas Utility Bill',
          amount: 118.45,
          type: 'expense',
          categoryId: 'cat_utilities',
          subcategory: 'Electricity',
          paymentMethod: 'credit_card',
          merchant: 'City Power & Gas',
          isRecurring: true,
          notes: 'Monthly power statement'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(8, maxDay)),
          title: 'Equinox Gym Membership',
          amount: 65.00,
          type: 'expense',
          categoryId: 'cat_health',
          subcategory: 'Gym Membership',
          paymentMethod: 'debit_card',
          merchant: 'Equinox Gym',
          isRecurring: true,
          notes: 'Monthly membership'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(12, maxDay)),
          title: 'Netflix 4K Ultra Subscription',
          amount: 22.99,
          type: 'expense',
          categoryId: 'cat_subscriptions',
          subcategory: 'Streaming (Netflix/Spotify)',
          paymentMethod: 'credit_card',
          merchant: 'Netflix Inc',
          isRecurring: true,
          notes: 'Streaming subscription'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(18, maxDay)),
          title: 'Spotify Duo Subscription',
          amount: 14.99,
          type: 'expense',
          categoryId: 'cat_subscriptions',
          subcategory: 'Streaming (Netflix/Spotify)',
          paymentMethod: 'credit_card',
          merchant: 'Spotify AB',
          isRecurring: true,
          notes: 'Streaming music'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(22, maxDay)),
          title: 'Gigabit Fiber Internet Plan',
          amount: 70.00,
          type: 'expense',
          categoryId: 'cat_utilities',
          subcategory: 'Internet / WiFi',
          paymentMethod: 'credit_card',
          merchant: 'Sonic Fiber',
          isRecurring: true,
          notes: 'Internet bill'
        },

        // Variable & Everyday Expenses
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(2, maxDay)),
          title: 'Whole Foods Market Weekly Stockup',
          amount: 142.80,
          type: 'expense',
          categoryId: 'cat_food',
          subcategory: 'Groceries',
          paymentMethod: 'credit_card',
          merchant: 'Whole Foods',
          isRecurring: false,
          notes: 'Fresh produce, dairy, bakery items'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(4, maxDay)),
          title: 'Chevron Fuel Station',
          amount: 54.30,
          type: 'expense',
          categoryId: 'cat_transport',
          subcategory: 'Gas / Fuel',
          paymentMethod: 'credit_card',
          merchant: 'Chevron',
          isRecurring: false,
          notes: 'Full tank unleaded'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(6, maxDay)),
          title: 'Blue Bottle Coffee Roasters',
          amount: 16.50,
          type: 'expense',
          categoryId: 'cat_food',
          subcategory: 'Coffee & Snacks',
          paymentMethod: 'digital_wallet',
          merchant: 'Blue Bottle Coffee',
          isRecurring: false,
          notes: 'Cappuccino & pastry with coworker'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(9, maxDay)),
          title: 'Trader Joe\'s Grocery Haul',
          amount: 98.40,
          type: 'expense',
          categoryId: 'cat_food',
          subcategory: 'Groceries',
          paymentMethod: 'credit_card',
          merchant: 'Trader Joe\'s',
          isRecurring: false,
          notes: 'Weekly pantry essentials'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(11, maxDay)),
          title: 'Osteria Del Corso Dinner',
          amount: 88.50,
          type: 'expense',
          categoryId: 'cat_food',
          subcategory: 'Restaurants',
          paymentMethod: 'credit_card',
          merchant: 'Osteria Del Corso',
          isRecurring: false,
          notes: 'Italian dinner'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(13, maxDay)),
          title: 'Amazon Online Order — Ergonomic Mouse',
          amount: 79.99,
          type: 'expense',
          categoryId: 'cat_shopping',
          subcategory: 'Electronics',
          paymentMethod: 'credit_card',
          merchant: 'Amazon',
          isRecurring: false,
          notes: 'Logitech MX Master mouse for work'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(16, maxDay)),
          title: 'CVS Pharmacy Prescription & Vitamins',
          amount: 34.20,
          type: 'expense',
          categoryId: 'cat_health',
          subcategory: 'Pharmacy & Meds',
          paymentMethod: 'credit_card',
          merchant: 'CVS Pharmacy',
          isRecurring: false,
          notes: 'Daily vitamins and cough medicine'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(17, maxDay)),
          title: 'Whole Foods Market Mid-Month Groceries',
          amount: 125.60,
          type: 'expense',
          categoryId: 'cat_food',
          subcategory: 'Groceries',
          paymentMethod: 'credit_card',
          merchant: 'Whole Foods',
          isRecurring: false,
          notes: 'Organic groceries & snacks'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(19, maxDay)),
          title: 'Subway & Metro Transit Card Recharge',
          amount: 60.00,
          type: 'expense',
          categoryId: 'cat_transport',
          subcategory: 'Public Transit',
          paymentMethod: 'digital_wallet',
          merchant: 'Metropolitan Transit',
          isRecurring: false,
          notes: 'Monthly train pass reload'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(21, maxDay)),
          title: 'AMC Cinema IMAX Tickets',
          amount: 42.00,
          type: 'expense',
          categoryId: 'cat_entertainment',
          subcategory: 'Movies & Events',
          paymentMethod: 'credit_card',
          merchant: 'AMC Theatres',
          isRecurring: false,
          notes: 'Dune Part 2 weekend tickets'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(23, maxDay)),
          title: 'Nordstrom Wardrobe Essentials',
          amount: 135.00,
          type: 'expense',
          categoryId: 'cat_shopping',
          subcategory: 'Clothing',
          paymentMethod: 'credit_card',
          merchant: 'Nordstrom',
          isRecurring: false,
          notes: 'Fall season merino sweater'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(24, maxDay)),
          title: 'Sweetgreen Salad Lunch',
          amount: 18.25,
          type: 'expense',
          categoryId: 'cat_food',
          subcategory: 'Restaurants',
          paymentMethod: 'digital_wallet',
          merchant: 'Sweetgreen',
          isRecurring: false,
          notes: 'Harvest bowl with teammates'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(26, maxDay)),
          title: 'Modern Hair Salon & Cut',
          amount: 55.00,
          type: 'expense',
          categoryId: 'cat_personal',
          subcategory: 'Hair & Grooming',
          paymentMethod: 'cash',
          merchant: 'Modern Studio Salon',
          isRecurring: false,
          notes: 'Haircut and styling'
        },
        {
          id: SpendWise.Utils.generateId('tx'),
          date: makeDate(year, month, Math.min(27, maxDay)),
          title: 'O\'Reilly Technical Books & Learning',
          amount: 49.00,
          type: 'expense',
          categoryId: 'cat_education',
          subcategory: 'Books & Audiobooks',
          paymentMethod: 'credit_card',
          merchant: 'O\'Reilly Media',
          isRecurring: false,
          notes: 'TypeScript & System Design book'
        }
      ];

      // Filter out transactions beyond maxDay for current month
      return txs.filter(t => {
        const tDay = parseInt(t.date.split('-')[2], 10);
        return tDay <= maxDay;
      });
    };

    // 1. Current Month (up to current day)
    const currentMonthTxs = generateMonthTransactions(curYear, curMonth, curDay);
    transactions.push(...currentMonthTxs);

    // 2. Previous Month (full month)
    const prevMonthDate = new Date(curYear, curMonth - 1, 1);
    const prevMonthDays = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate();
    const prevMonthTxs = generateMonthTransactions(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), prevMonthDays);
    transactions.push(...prevMonthTxs);

    // 3. Two Months Ago (full month)
    const twoMonthsAgoDate = new Date(curYear, curMonth - 2, 1);
    const twoMonthsAgoDays = new Date(twoMonthsAgoDate.getFullYear(), twoMonthsAgoDate.getMonth() + 1, 0).getDate();
    const twoMonthsAgoTxs = generateMonthTransactions(twoMonthsAgoDate.getFullYear(), twoMonthsAgoDate.getMonth(), twoMonthsAgoDays);
    transactions.push(...twoMonthsAgoTxs);

    // Save all to storage
    this.saveTransactions(transactions);
    this.saveCategories(SpendWise.Config.DEFAULT_CATEGORIES);
    this.saveRecurring(recurringRules);
    this.setItem(SpendWise.Config.STORAGE_KEYS.INITIALIZED, true);

    return {
      transactions,
      categories: SpendWise.Config.DEFAULT_CATEGORIES,
      recurring: recurringRules
    };
  },

  /**
   * Initialize storage on first application load if empty
   */
  initStorage() {
    const isInitialized = this.getItem(SpendWise.Config.STORAGE_KEYS.INITIALIZED);
    const txs = this.getTransactions();

    if (!isInitialized || !txs || txs.length === 0) {
      console.log('SpendWise: First run detected. Populating rich demo dataset...');
      this.generateDemoData();
    }
  },

  /**
   * Reset all data to clean demo state
   */
  resetToDemoData() {
    this.removeItem(SpendWise.Config.STORAGE_KEYS.TRANSACTIONS);
    this.removeItem(SpendWise.Config.STORAGE_KEYS.CATEGORIES);
    this.removeItem(SpendWise.Config.STORAGE_KEYS.RECURRING);
    this.removeItem(SpendWise.Config.STORAGE_KEYS.INITIALIZED);
    return this.generateDemoData();
  },

  /**
   * Export complete application state to JSON
   */
  exportAllJSON() {
    const payload = {
      version: SpendWise.Config.VERSION,
      exportDate: new Date().toISOString(),
      transactions: this.getTransactions(),
      categories: this.getCategories(),
      recurring: this.getRecurring(),
      settings: this.getSettings()
    };
    SpendWise.Utils.downloadFile(
      `spendwise_backup_${new Date().toISOString().split('T')[0]}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    );
  },

  /**
   * Import complete application state from JSON
   */
  importAllJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions && Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }
      if (data.categories && Array.isArray(data.categories)) {
        this.saveCategories(data.categories);
      }
      if (data.recurring && Array.isArray(data.recurring)) {
        this.saveRecurring(data.recurring);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings(data.settings);
      }
      return { success: true, count: data.transactions ? data.transactions.length : 0 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

