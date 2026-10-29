/**
 * SpendWise — Configuration & Constants
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Config = {
  APP_NAME: 'SpendWise — Smart Expense Tracker',
  VERSION: '1.0.0',

  STORAGE_KEYS: {
    TRANSACTIONS: 'spendwise_transactions_v1',
    CATEGORIES: 'spendwise_categories_v1',
    RECURRING: 'spendwise_recurring_v1',
    SETTINGS: 'spendwise_settings_v1',
    INITIALIZED: 'spendwise_is_initialized_v1'
  },

  CURRENCIES: [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
    { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', locale: 'en-AU' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' }
  ],

  DEFAULT_CURRENCY: 'USD',

  PAYMENT_METHODS: [
    { id: 'credit_card', name: 'Credit Card', icon: 'credit-card' },
    { id: 'debit_card', name: 'Debit Card', icon: 'wallet' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: 'landmark' },
    { id: 'cash', name: 'Cash', icon: 'banknote' },
    { id: 'digital_wallet', name: 'Digital Wallet / UPI', icon: 'smartphone' }
  ],

  RECURRING_FREQUENCIES: [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly' }
  ],

  DATE_RANGE_PRESETS: [
    { id: 'this_month', name: 'This Month' },
    { id: 'last_month', name: 'Last Month' },
    { id: 'last_30_days', name: 'Last 30 Days' },
    { id: 'last_90_days', name: 'Last 90 Days' },
    { id: 'this_year', name: 'This Year' },
    { id: 'all_time', name: 'All Time' },
    { id: 'custom', name: 'Custom Range' }
  ],

  DEFAULT_CATEGORIES: [
    // Expense Categories
    {
      id: 'cat_food',
      name: 'Food & Groceries',
      type: 'expense',
      icon: 'utensils',
      color: '#10B981', // Emerald
      budget: 650,
      subcategories: ['Groceries', 'Restaurants', 'Coffee & Snacks', 'Delivery']
    },
    {
      id: 'cat_housing',
      name: 'Housing & Rent',
      type: 'expense',
      icon: 'home',
      color: '#3B82F6', // Blue
      budget: 1500,
      subcategories: ['Rent/Mortgage', 'Maintenance', 'Furnishing', 'Property Tax']
    },
    {
      id: 'cat_transport',
      name: 'Transport',
      type: 'expense',
      icon: 'car',
      color: '#F59E0B', // Amber
      budget: 350,
      subcategories: ['Gas / Fuel', 'Public Transit', 'Rideshare / Taxi', 'Car Insurance']
    },
    {
      id: 'cat_utilities',
      name: 'Bills & Utilities',
      type: 'expense',
      icon: 'zap',
      color: '#8B5CF6', // Purple
      budget: 280,
      subcategories: ['Electricity', 'Water', 'Internet / WiFi', 'Phone Plan']
    },
    {
      id: 'cat_shopping',
      name: 'Shopping',
      type: 'expense',
      icon: 'shopping-bag',
      color: '#EC4899', // Pink
      budget: 400,
      subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Gifts']
    },
    {
      id: 'cat_entertainment',
      name: 'Entertainment',
      type: 'expense',
      icon: 'film',
      color: '#F43F5E', // Rose
      budget: 200,
      subcategories: ['Movies & Events', 'Hobbies', 'Gaming', 'Outings']
    },
    {
      id: 'cat_health',
      name: 'Health & Fitness',
      type: 'expense',
      icon: 'activity',
      color: '#14B8A6', // Teal
      budget: 220,
      subcategories: ['Pharmacy & Meds', 'Gym Membership', 'Doctor / Dental', 'Supplements']
    },
    {
      id: 'cat_subscriptions',
      name: 'Subscriptions',
      type: 'expense',
      icon: 'tv',
      color: '#6366F1', // Indigo
      budget: 95,
      subcategories: ['Streaming (Netflix/Spotify)', 'Software / Cloud', 'News & Media']
    },
    {
      id: 'cat_education',
      name: 'Education',
      type: 'expense',
      icon: 'book-open',
      color: '#06B6D4', // Cyan
      budget: 150,
      subcategories: ['Books & Audiobooks', 'Courses / Tuition', 'Certifications']
    },
    {
      id: 'cat_personal',
      name: 'Personal Care',
      type: 'expense',
      icon: 'smile',
      color: '#EAB308', // Yellow
      budget: 120,
      subcategories: ['Hair & Grooming', 'Skincare', 'Spa & Wellness']
    },
    {
      id: 'cat_travel',
      name: 'Travel',
      type: 'expense',
      icon: 'plane',
      color: '#0EA5E9', // Sky
      budget: 300,
      subcategories: ['Flights', 'Hotels / Lodging', 'Activities & Sightseeing']
    },
    {
      id: 'cat_other_exp',
      name: 'Other Expense',
      type: 'expense',
      icon: 'tag',
      color: '#64748B', // Slate
      budget: 150,
      subcategories: ['Miscellaneous', 'Donations', 'Fees']
    },

    // Income Categories
    {
      id: 'cat_salary',
      name: 'Salary & Wages',
      type: 'income',
      icon: 'briefcase',
      color: '#059669', // Dark Emerald
      budget: 0,
      subcategories: ['Base Salary', 'Bonus', 'Overtime']
    },
    {
      id: 'cat_freelance',
      name: 'Freelance & Consulting',
      type: 'income',
      icon: 'laptop',
      color: '#0D9488', // Dark Teal
      budget: 0,
      subcategories: ['Client Projects', 'Consulting Fees', 'Contract Work']
    },
    {
      id: 'cat_investments',
      name: 'Investments & Dividends',
      type: 'income',
      icon: 'trending-up',
      color: '#2563EB', // Blue
      budget: 0,
      subcategories: ['Stock Dividends', 'Interest / Yield', 'Capital Gains']
    },
    {
      id: 'cat_gifts',
      name: 'Gifts & Reimbursements',
      type: 'income',
      icon: 'gift',
      color: '#7C3AED', // Violet
      budget: 0,
      subcategories: ['Gift Received', 'Expense Reimbursement', 'Refunds']
    },
    {
      id: 'cat_other_inc',
      name: 'Other Income',
      type: 'income',
      icon: 'dollar-sign',
      color: '#475569', // Charcoal
      budget: 0,
      subcategories: ['Side Income', 'Asset Sale', 'Misc Income']
    }
  ],

  AVAILABLE_ICONS: [
    'utensils', 'home', 'car', 'zap', 'shopping-bag', 'film',
    'activity', 'tv', 'book-open', 'smile', 'plane', 'tag',
    'briefcase', 'laptop', 'trending-up', 'gift', 'dollar-sign',
    'coffee', 'heart', 'shield', 'wifi', 'camera', 'music', 'package'
  ],

  PALETTE_COLORS: [
    '#10B981', '#059669', '#14B8A6', '#0D9488', '#3B82F6',
    '#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
    '#F59E0B', '#EAB308', '#06B6D4', '#0EA5E9', '#64748B'
  ]
};

