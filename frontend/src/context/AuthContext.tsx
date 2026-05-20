import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth state from localStorage on startup
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("access_token");
      const savedUsername = localStorage.getItem("username");
      const savedRole = localStorage.getItem("role");

      if (token && savedUsername && savedRole) {
        setUser({
          username: savedUsername,
          role: savedRole,
        });
      }
      setLoading(false);
    };

    initAuth();

    // Listen to our custom Axios interceptor "auth_session_expired" event
    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener("auth_session_expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth_session_expired", handleSessionExpired);
    };
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { username, password });
      const { access_token, refresh_token, role, username: resUsername } = res.data;

      // Save tokens and user details in localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("username", resUsername);
      localStorage.setItem("role", role);

      // Set user context
      setUser({
        username: resUsername,
        role: role,
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        username,
        email,
        password,
        role,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
