import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// export const API_ENDPOINTS = {
//   AUTH: {
//     LOGIN: `${API_BASE_URL}/api/auth/login`,
//     REGISTER: `${API_BASE_URL}/api/auth/register`,
//     LOGOUT: `${API_BASE_URL}/api/auth/logout`,
//   },
//   USERS: {
//     PROFILE: `${API_BASE_URL}/api/users/profile`,
//     UPDATE: `${API_BASE_URL}/api/users/update`,
//   },
//   ANALYSIS: {
//     UPLOAD: `${API_BASE_URL}/api/analysis/upload`,
//     STATUS: `${API_BASE_URL}/api/analysis/status`,
//     RESULTS: `${API_BASE_URL}/api/analysis/results`,
//   },
//   REPORTS: {
//     LIST: `${API_BASE_URL}/api/reports`,
//     DOWNLOAD: `${API_BASE_URL}/api/reports/download`,
//     GENERATE: `${API_BASE_URL}/api/reports/generate`,
//   },
//   NOTIFICATIONS: {
//     LIST: `${API_BASE_URL}/api/notifications`,
//     MARK_READ: `${API_BASE_URL}/api/notifications/mark-read`,
//   },
// };

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      console.log("Attempting to login with credentials:", credentials);
      const response = await apiClient.post("/auth/login", credentials);
      console.log("Login response:", response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  },

  async validateToken(token) {
    try {
      const response = await apiClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await apiClient.put("/auth/password", passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken() {
    try {
      const response = await apiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { apiClient };
