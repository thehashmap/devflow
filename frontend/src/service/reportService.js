import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/reports`,
  timeout: 30000, // 30 seconds for report generation
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const reportService = {
  // Get all reports with filters
  getReports: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.dateRange) {
        params.append('dateRange', filters.dateRange);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await apiClient.get(`?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    try {
      const response = await apiClient.get(`/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report:', error);
      throw error;
    }
  },

  // Generate summary report
  generateSummaryReport: async (filters = {}) => {
    try {
      const response = await apiClient.post('/generate', {
        reportType: 'summary',
        filters: {
          dateRange: filters.dateRange || '30',
          includeMetrics: true,
          includeTrends: true,
          includeRecommendations: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  },

  // Generate detailed analysis report
  generateDetailedReport: async (analysisId) => {
    try {
      const response = await apiClient.post('/generate', {
        reportType: 'detailed',
        analysisId: analysisId,
        includeCodeSample: true,
        includeRecommendations: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate detailed report:', error);
      throw error;
    }
  },

  // Generate comparison report
  generateComparisonReport: async (analysisIds) => {
    try {
      const response = await apiClient.post('/generate', {
        reportType: 'comparison',
        analysisIds: analysisIds,
        includeMetrics: true,
        includeTrends: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate comparison report:', error);
      throw error;
    }
  },

  // Download report in specified format
  downloadReport: async (reportId, format = 'pdf') => {
    try {
      const response = await apiClient.get(`/${reportId}/download`, {
        params: { format },
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on format
      const filename = `devflow-report-${reportId}.${format}`;
      link.setAttribute('download', filename);

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  },

  // Get report statistics
  getReportStats: async () => {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report stats:', error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const response = await apiClient.delete(`/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  },

  // Get report templates
  getReportTemplates: async () => {
    try {
      const response = await apiClient.get('/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report templates:', error);
      throw error;
    }
  },

  // Schedule report generation
  scheduleReport: async (reportConfig) => {
    try {
      const response = await apiClient.post('/schedule', {
        reportType: reportConfig.type,
        schedule: reportConfig.schedule, // cron expression
        filters: reportConfig.filters,
        recipients: reportConfig.recipients,
        format: reportConfig.format || 'pdf'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  }
};