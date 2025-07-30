// context/AuthContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import apiClient from "../lib/apiClient";
import { AuthResponseModel } from "@/lib/types/auth"; // You'll need to define this type based on backend DTO

interface AuthContextType {
  user: AuthResponseModel | null;
  login: (username: string, password: string) => Promise<boolean>; // Returns success
  register: (
    username: string,
    email: string,
    password: string,
    brandName: string
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial load check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthResponseModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (token exists)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const userData =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && userData) {
      try {
        const parsedUser: AuthResponseModel = JSON.parse(userData);
        // Optional: Add a check if token is expired (requires JWT decoding library)
        if (new Date(parsedUser.expiration) > new Date()) {
          setUser(parsedUser);
          // --- Use the public method to set token ---
          apiClient.setAuthToken(token);
          // ------------------------------------------
        } else {
          // Token expired, clear storage
          // --- Use the public method to clear token ---
          apiClient.clearAuthToken();
          // -------------------------------------------
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        // --- Use the public method to clear token ---
        apiClient.clearAuthToken();
        // -------------------------------------------
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post<AuthResponseModel>("/auth/login", {
        username,
        password,
      });
      const userData = response.data;
      setUser(userData);
      // --- Use the public method to set token ---
      apiClient.setAuthToken(userData.token);
      // ------------------------------------------
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
      }
      return true;
    } catch (err: any) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    brandName: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post<AuthResponseModel>(
        "/Auth/register",
        {
          username,
          email,
          password,
          brandName,
        }
      );

      console.log(response);
      const userData = response.data;
      setUser(userData);
      // --- Use the public method to set token ---
      apiClient.setAuthToken(userData.token);
      // ------------------------------------------
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
      }
      return true;
    } catch (err: any) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // --- Use the public method to clear token ---
    apiClient.clearAuthToken();
    // ------------------------------------------
    // Redirect to login page or home page should be handled by the component calling logout
    // or by listening to auth state changes (e.g., ProtectedRoute).
  };

  const isAuthenticated = !!user && new Date(user.expiration) > new Date();

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
