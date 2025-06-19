import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { QUALITY_SCORE_RANGES, ERROR_MESSAGES, FILE_UPLOAD } from './constants';

// Date Utilities
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

// Quality Score Utilities
export const getQualityScoreColor = (score) => {
  if (score >= QUALITY_SCORE_RANGES.EXCELLENT.min) return QUALITY_SCORE_RANGES.EXCELLENT.color;
  if (score >= QUALITY_SCORE_RANGES.GOOD.min) return QUALITY_SCORE_RANGES.GOOD.color;
  if (score >= QUALITY_SCORE_RANGES.FAIR.min) return QUALITY_SCORE_RANGES.FAIR.color;
  return QUALITY_SCORE_RANGES.POOR.color;
};

export const getQualityScoreLabel = (score) => {
  if (score >= QUALITY_SCORE_RANGES.EXCELLENT.min) return QUALITY_SCORE_RANGES.EXCELLENT.label;
  if (score >= QUALITY_SCORE_RANGES.GOOD.min) return QUALITY_SCORE_RANGES.GOOD.label;
  if (score >= QUALITY_SCORE_RANGES.FAIR.min) return QUALITY_SCORE_RANGES.FAIR.label;
  return QUALITY_SCORE_RANGES.POOR.label;
};

// File Utilities
export const validateFile = (file) => {
  const errors = [];

  // Check file size
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    errors.push(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();

  const iconMap = {
    js: '📄',
    jsx: '⚛️',
    ts: '📘',
    tsx: '⚛️',
    java: '☕',
    py: '🐍',
    go: '🐹',
    rb: '💎',
    php: '🐘',
    cs: '🔷',
    cpp: '🔧',
    c: '🔧',
    h: '📋'
  };

  return iconMap[extension] || '📄';
};

// String Utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Array Utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Number Utilities
export const formatNumber = (num, decimals = 0) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

// URL Utilities
export const buildUrl = (base, params = {}) => {
  const url = new URL(base);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Local Storage Utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage:', error);
  }
};

// Error Handling Utilities
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR;
  } else if (error.request) {
    // Request made but no response
    return ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Something else happened
    return error.message || ERROR_MESSAGES.SERVER_ERROR;
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

// Validation Utilities
export const validateEmail = (email) => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

// Debounce Utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep Clone Utility
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

// Color Utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Random Utilities
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default {
  formatDate,
  formatRelativeTime,
  getQualityScoreColor,
  getQualityScoreLabel,
  validateFile,
  formatFileSize,
  getFileIcon,
  truncateText,
  capitalizeFirst,
  slugify,
  groupBy,
  sortBy,
  formatNumber,
  formatPercentage,
  buildUrl,
  getQueryParams,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  getErrorMessage,
  isNetworkError,
  validateEmail,
  validatePassword,
  debounce,
  throttle,
  deepClone,
  hexToRgb,
  rgbToHex,
  generateId,
  generateUUID
};