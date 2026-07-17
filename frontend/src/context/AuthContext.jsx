import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("hd_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = (authResponse) => {
    const { token, ...userData } = authResponse;
    localStorage.setItem("hd_token", token);
    localStorage.setItem("hd_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      persistSession(data);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to log in. Check your credentials.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (details) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(details);
      persistSession(data);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        "Unable to create your account.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hd_token");
    localStorage.removeItem("hd_user");
    setUser(null);
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("hd_user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
