import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/analysis`,
  timeout: 30000, // 30 seconds for file uploads
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
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

export const codeAnalysisService = {
  // Upload files for analysis
  uploadFiles: async (formData) => {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // You can use this for progress bars
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  // Get all analyses for current user
  getAnalyses: async (params = {}) => {
    const { page = 0, size = 10, status, language, sortBy = 'createdAt', sortDir = 'desc' } = params;
    const response = await apiClient.get('/analyses', {
      params: { page, size, status, language, sortBy, sortDir }
    });
    return response.data;
  },

  // Get specific analysis by ID
  getAnalysis: async (analysisId) => {
    const response = await apiClient.get(`/analyses/${analysisId}`);
    return response.data;
  },

  // Get analysis results/report
  getAnalysisResults: async (analysisId) => {
    const response = await apiClient.get(`/analyses/${analysisId}/results`);
    return response.data;
  },

  // Get analysis statistics
  getAnalysisStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  },

  // Re-run analysis
  rerunAnalysis: async (analysisId) => {
    const response = await apiClient.post(`/analyses/${analysisId}/rerun`);
    return response.data;
  },

  // Delete analysis
  deleteAnalysis: async (analysisId) => {
    const response = await apiClient.delete(`/analyses/${analysisId}`);
    return response.data;
  },

  // Get supported languages and analysis types
  getSupportedOptions: async () => {
    const response = await apiClient.get('/options');
    return response.data;
  },

  // Update analysis configuration
  updateAnalysisConfig: async (analysisId, config) => {
    const response = await apiClient.put(`/analyses/${analysisId}/config`, config);
    return response.data;
  },

  // Get analysis logs
  getAnalysisLogs: async (analysisId) => {
    const response = await apiClient.get(`/analyses/${analysisId}/logs`);
    return response.data;
  },

  // Export analysis results
  exportAnalysis: async (analysisId, format = 'pdf') => {
    const response = await apiClient.get(`/analyses/${analysisId}/export`, {
      params: { format },
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analysis-${analysisId}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  // Get quality metrics over time
  getQualityTrends: async (timeRange = '30d') => {
    const response = await apiClient.get('/trends', {
      params: { timeRange }
    });
    return response.data;
  },

  // Compare analyses
  compareAnalyses: async (analysisIds) => {
    const response = await apiClient.post('/compare', { analysisIds });
    return response.data;
  },

  // Get analysis feedback/comments
  getAnalysisFeedback: async (analysisId) => {
    const response = await apiClient.get(`/analyses/${analysisId}/feedback`);
    return response.data;
  },

  // Add feedback/comment to analysis
  addAnalysisFeedback: async (analysisId, feedback) => {
    const response = await apiClient.post(`/analyses/${analysisId}/feedback`, feedback);
    return response.data;
  },

  // Get AI recommendations
  getRecommendations: async (analysisId) => {
    const response = await apiClient.get(`/analyses/${analysisId}/recommendations`);
    return response.data;
  },

  // Cancel running analysis
  cancelAnalysis: async (analysisId) => {
    const response = await apiClient.post(`/analyses/${analysisId}/cancel`);
    return response.data;
  }
};