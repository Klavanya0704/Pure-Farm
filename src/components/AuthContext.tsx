import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserSession {
  name: string;
  role: string;
  phoneOrEmail: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (phoneOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "purefarm_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on load
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          window.localStorage.removeItem(SESSION_KEY);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (phoneOrEmail: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test credentials validation
    const isValidPhone = phoneOrEmail === "1234567890" && password === "password123";
    const isValidEmail = phoneOrEmail.toLowerCase() === "farmer@purefarm.com" && password === "password123";

    if (isValidPhone || isValidEmail) {
      const session: UserSession = {
        name: "Lavanya",
        role: "Farmer",
        phoneOrEmail: phoneOrEmail,
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      setUser(session);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
