import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../service/authService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Initializing auth...");
      try {
        const token = localStorage.getItem("token");
        console.log("🔑 Token found:", token ? "Yes" : "No");

        if (token && !user) {
          console.log("📞 Calling /auth/me to validate token");
          const userData = await authService.validateToken(token);
          console.log("✅ Token validation successful:", userData);
          setUser(userData);
        } else if (token && user) {
          console.log("👤 User already set, skipping token validation");
        } else {
          console.log("❌ No token found");
        }
      } catch (error) {
        console.error("❌ Auth initialization failed:", error);

        // Check if it's a real authentication error or just a network issue
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("🔒 Authentication error, clearing token");
          localStorage.removeItem("token");
          setUser(null);
        } else {
          console.log(
            "🌐 Network/server error, keeping user logged in if exists"
          );
          // Keep user logged in for network errors
        }
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log("✅ Auth initialization complete");
      }
    };

    if (!initialized) {
      initializeAuth();
    }
  }, [user, initialized]);

  const login = async (credentials) => {
    console.log("🔑 Login attempt started");
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      console.log("📝 Login response:", response);

      if (response.token) {
        console.log("💾 Storing token in localStorage");
        localStorage.setItem("token", response.token);

        // Try to get full user details from /me endpoint
        try {
          console.log("📞 Fetching user details from /auth/me");
          const userResponse = await authService.validateToken(response.token);
          console.log("👤 User details fetched:", userResponse);
          setUser(userResponse);
        } catch (userError) {
          console.warn(
            "⚠️ Could not fetch user details, using JWT response:",
            userError
          );
          // Fall back to basic user info from JwtResponseDto
          const basicUser = {
            username: response.username,
            email: response.email,
          };
          console.log("👤 Setting basic user info:", basicUser);
          setUser(basicUser);
        }

        toast.success("Login successful!");
        return { success: true };
      } else {
        console.error("❌ No token in response");
        return { success: false, error: "No token received" };
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      const message =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    console.log("📝 Registration attempt started");
    try {
      setLoading(true);
      const response = await authService.register(userData);
      console.log("📝 Registration response:", response);

      if (response.id) {
        // Registration successful, but no token returned
        toast.success("Registration successful! Please login.");
        return { success: true, requiresLogin: true };
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("🚪 Logout initiated");
    try {
      await authService.logout();
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setInitialized(false);
      toast.success("Logged out successfully");
      console.log("✅ Logout complete");
    }
  };

  const updateProfile = async (profileData) => {
    console.log("👤 Profile update attempt started");
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Profile update failed:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  console.log(
    "🔍 AuthProvider render - User:",
    user,
    "Loading:",
    loading,
    "Authenticated:",
    !!user
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
