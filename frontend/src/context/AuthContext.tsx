import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, type UserProfile } from "../api/authApi";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email?: string; username?: string; password?: string }) => Promise<void>;
  register: (userData: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from stored token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    authApi.getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: { email?: string; username?: string; password?: string }) => {
    const { user, token: newToken } = await authApi.login(credentials);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(user);
  };

  const register = async (userData: Record<string, any>) => {
    const { user, token: newToken } = await authApi.register(userData);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      // Clear any active workout draft keys from localStorage
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("active_workout_draft_") || key === "active_workout_id")) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn("Failed to clean workout drafts from localStorage:", e);
      }
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
