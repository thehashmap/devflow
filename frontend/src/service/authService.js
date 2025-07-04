import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

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
      // Only redirect to login if we're not already on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
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
      return response.data; // This should be JwtResponseDto
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data; // This should be UserResponseDto
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async logout() {
    try {
      // Your backend doesn't seem to have a logout endpoint, so just clear local storage
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  async validateToken(token) {
    try {
      const response = await apiClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // This should be UserResponseDto
    } catch (error) {
      console.error(
        "Token validation error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data; // This should be UserResponseDto
    } catch (error) {
      console.error(
        "Get current user error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      // You might need to add this endpoint to your backend
      const response = await apiClient.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      console.error(
        "Profile update error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async changePassword(passwordData) {
    try {
      // You might need to add this endpoint to your backend
      const response = await apiClient.put("/auth/password", passwordData);
      return response.data;
    } catch (error) {
      console.error(
        "Password change error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async refreshToken() {
    try {
      // You might need to add this endpoint to your backend
      const response = await apiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      console.error(
        "Token refresh error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export { apiClient };
