// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};

// Analysis Status
export const ANALYSIS_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

// Analysis Status Labels
export const ANALYSIS_STATUS_LABELS = {
  [ANALYSIS_STATUS.PENDING]: 'Pending',
  [ANALYSIS_STATUS.PROCESSING]: 'Processing',
  [ANALYSIS_STATUS.COMPLETED]: 'Completed',
  [ANALYSIS_STATUS.FAILED]: 'Failed'
};

// Report Types
export const REPORT_TYPES = {
  SUMMARY: 'SUMMARY',
  DETAILED: 'DETAILED',
  TREND: 'TREND'
};

// Report Formats
export const REPORT_FORMATS = {
  PDF: 'PDF',
  JSON: 'JSON',
  CSV: 'CSV'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  VIEWER: 'VIEWER'
};

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.go', '.rb', '.php', '.cs', '.cpp', '.c', '.h'],
  ALLOWED_MIME_TYPES: [
    'text/plain',
    'text/javascript',
    'application/javascript',
    'text/x-python',
    'text/x-java-source',
    'text/x-go',
    'text/x-ruby',
    'text/x-php',
    'text/x-csharp',
    'text/x-c++src',
    'text/x-csrc'
  ]
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6'
};

// Quality Score Ranges
export const QUALITY_SCORE_RANGES = {
  EXCELLENT: { min: 90, max: 100, color: 'green', label: 'Excellent' },
  GOOD: { min: 70, max: 89, color: 'blue', label: 'Good' },
  FAIR: { min: 50, max: 69, color: 'yellow', label: 'Fair' },
  POOR: { min: 0, max: 49, color: 'red', label: 'Poor' }
};

// Dashboard Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  NOTIFICATIONS: 10000, // 10 seconds
  ANALYSIS_STATUS: 5000 // 5 seconds
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'devflow_auth_token',
  USER_PREFERENCES: 'devflow_user_preferences',
  THEME: 'devflow_theme'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  API: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported code file.',
  LOGIN_REQUIRED: 'Please log in to continue.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  ANALYSIS_STARTED: 'Code analysis started!',
  REPORT_GENERATED: 'Report generated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ANALYSIS_STARTED: 'analysis_started',
  ANALYSIS_PROGRESS: 'analysis_progress',
  ANALYSIS_COMPLETED: 'analysis_completed',
  ANALYSIS_FAILED: 'analysis_failed',
  REPORT_READY: 'report_ready',
  NOTIFICATION: 'notification'
};

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  ANIMATION_DURATION: 300,
  GRID_COLOR: '#E5E7EB',
  TEXT_COLOR: '#6B7280'
};

export default {
  API_CONFIG,
  ANALYSIS_STATUS,
  ANALYSIS_STATUS_LABELS,
  REPORT_TYPES,
  REPORT_FORMATS,
  NOTIFICATION_TYPES,
  USER_ROLES,
  FILE_UPLOAD,
  PAGINATION,
  COLORS,
  QUALITY_SCORE_RANGES,
  REFRESH_INTERVALS,
  STORAGE_KEYS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WS_EVENTS,
  CHART_CONFIG
};