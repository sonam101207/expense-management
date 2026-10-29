/**
 * SpendWise — Utility Functions
 */
window.SpendWise = window.SpendWise || {};

SpendWise.Utils = {
  /**
   * Format a numeric amount into local currency string
   * @param {number} amount
   * @param {string} currencyCode
   * @param {boolean} showDecimals
   * @returns {string}
   */
  formatCurrency(amount, currencyCode = 'USD', showDecimals = true) {
    const num = Number(amount);
    if (isNaN(num)) return '$0.00';

    const curr = SpendWise.Config.CURRENCIES.find(c => c.code === currencyCode) || SpendWise.Config.CURRENCIES[0];
    const isJpy = currencyCode === 'JPY';

    try {
      return new Intl.NumberFormat(curr.locale || 'en-US', {
        style: 'currency',
        currency: curr.code,
        minimumFractionDigits: isJpy ? 0 : (showDecimals ? 2 : 0),
        maximumFractionDigits: isJpy ? 0 : (showDecimals ? 2 : 0)
      }).format(num);
    } catch (e) {
      return `${curr.symbol}${num.toFixed(isJpy ? 0 : 2)}`;
    }
  },

  /**
   * Format a date into human-readable strings
   * @param {string|Date} dateInput
   * @param {string} formatType 'short' | 'medium' | 'full' | 'monthYear' | 'relative'
   * @returns {string}
   */
  formatDate(dateInput, formatType = 'medium') {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput + (dateInput.length === 10 ? 'T00:00:00' : '')) : new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    if (formatType === 'relative') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - compareDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays === -1) return 'Tomorrow';
      if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
    }

    switch (formatType) {
      case 'short':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'full':
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'monthYear':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'medium':
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  },

  /**
   * Format percentage with optional plus/minus sign
   * @param {number} value
   * @param {boolean} includeSign
   * @returns {string}
   */
  formatPercentage(value, includeSign = false) {
    if (isNaN(value) || !isFinite(value)) return '0.0%';
    const fixed = value.toFixed(1);
    if (includeSign) {
      return value > 0 ? `+${fixed}%` : `${fixed}%`;
    }
    return `${fixed}%`;
  },

  /**
   * Calculate exact start & end dates for presets and their preceding comparison periods
   * @param {string} preset
   * @param {string} customStart
   * @param {string} customEnd
   * @returns {Object} { startDate, endDate, prevStartDate, prevEndDate, label }
   */
  calculatePeriodDates(preset = 'this_month', customStart = null, customEnd = null) {
    const now = new Date();
    let startDate, endDate, prevStartDate, prevEndDate, label;

    if (preset === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      label = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (preset === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      label = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (preset === 'last_30_days') {
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      startDate = new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);

      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(prevEndDate.getTime() - 29 * 24 * 60 * 60 * 1000);
      prevStartDate.setHours(0, 0, 0, 0);
      label = 'Last 30 Days';
    } else if (preset === 'last_90_days') {
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      startDate = new Date(endDate.getTime() - 89 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);

      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(prevEndDate.getTime() - 89 * 24 * 60 * 60 * 1000);
      prevStartDate.setHours(0, 0, 0, 0);
      label = 'Last 90 Days';
    } else if (preset === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      label = `Year ${now.getFullYear()}`;
    } else if (preset === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart + 'T00:00:00');
      endDate = new Date(customEnd + 'T23:59:59.999');

      const durationMs = endDate.getTime() - startDate.getTime();
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(prevEndDate.getTime() - durationMs);
      label = `${this.formatDate(startDate, 'short')} - ${this.formatDate(endDate, 'short')}`;
    } else {
      // All Time
      startDate = new Date(2000, 0, 1);
      endDate = new Date(2099, 11, 31, 23, 59, 59);
      prevStartDate = null;
      prevEndDate = null;
      label = 'All Time';
    }

    return { startDate, endDate, prevStartDate, prevEndDate, label };
  },

  /**
   * Generate unique UUID string
   * @param {string} prefix
   * @returns {string}
   */
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} str
   * @returns {string}
   */
  sanitizeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Download a text file / CSV in browser
   * @param {string} filename
   * @param {string} content
   * @param {string} mimeType
   */
  downloadFile(filename, content, mimeType = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Convert an array of transactions to CSV format
   * @param {Array} transactions
   * @param {Array} categories
   * @returns {string}
   */
  transactionsToCSV(transactions, categories) {
    const catMap = new Map((categories || []).map(c => [c.id, c.name]));
    const headers = ['ID', 'Date', 'Type', 'Title', 'Amount', 'Category', 'Subcategory', 'Payment Method', 'Merchant/Source', 'Recurring', 'Notes'];
    
    const rows = transactions.map(tx => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type}"`,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      tx.amount,
      `"${(catMap.get(tx.categoryId) || tx.category || '').replace(/"/g, '""')}"`,
      `"${(tx.subcategory || '').replace(/"/g, '""')}"`,
      `"${(tx.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(tx.merchant || '').replace(/"/g, '""')}"`,
      tx.isRecurring ? 'Yes' : 'No',
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  },

  /**
   * Parse a CSV string into transactions array
   * @param {string} csvText
   * @returns {Array}
   */
  parseTransactionsCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to split by comma ignoring quotes
      const values = [];
      let inQuote = false;
      let curr = '';

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(curr.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          curr = '';
        } else {
          curr += char;
        }
      }
      values.push(curr.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const amount = parseFloat(row.amount || row.total || '0');
      if (!isNaN(amount) && amount > 0) {
        transactions.push({
          id: row.id || SpendWise.Utils.generateId('tx'),
          date: row.date || new Date().toISOString().split('T')[0],
          type: (row.type && row.type.toLowerCase().includes('inc')) ? 'income' : 'expense',
          title: row.title || row.description || 'Imported Transaction',
          amount: Math.abs(amount),
          categoryId: row.categoryid || 'cat_other_exp',
          category: row.category || 'Other Expense',
          subcategory: row.subcategory || '',
          paymentMethod: row.paymentmethod || 'credit_card',
          merchant: row['merchant/source'] || row.merchant || '',
          isRecurring: (row.recurring || '').toLowerCase() === 'yes',
          notes: row.notes || ''
        });
      }
    }

    return transactions;
  },

  /**
   * Debounce helper
   */
  debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Deep clone helper
   */
  deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return { ...obj };
    }
  }
};

