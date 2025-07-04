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

  // DEV: Set a dummy user for development so all pages are accessible
  useEffect(() => {
    // Comment out the real auth logic for now
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await authService.validateToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();

    // Set a dummy user
    // setUser({
    //   id: 1,
    //   firstName: 'Dev',
    //   lastName: 'User',
    //   email: 'devuser@example.com',
    //   role: 'admin',
    //   avatar: '',
    // });
    // setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.token) {
        console.log("In AuthProvider login:", response);
        localStorage.setItem("token", response.token);
        setUser(response.username);
        toast.success("Login successful!");
        return { success: true };
      }
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);

      if (response.token) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
        toast.success("Registration successful!");
        return { success: true };
      }
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Profile update failed:", error);
      const message = error.response?.data?.message || "Profile update failed";
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
