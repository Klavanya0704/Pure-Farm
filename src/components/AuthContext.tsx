import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "farmer" | "buyer" | "seller" | "admin";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "purefarm_session";

// Development test accounts data
const TEST_ACCOUNTS: Record<string, Omit<UserSession, "id"> & { id: string }> = {
  "farmer@purefarm.test": {
    id: "u-farmer",
    name: "Lavanya (Farmer)",
    email: "farmer@purefarm.test",
    role: "farmer",
  },
  "1234567890": { // Let phone map to farmer for backward compatibility
    id: "u-farmer",
    name: "Lavanya (Farmer)",
    email: "farmer@purefarm.test",
    role: "farmer",
  },
  "buyer@purefarm.test": {
    id: "u-buyer",
    name: "Ramesh (Buyer)",
    email: "buyer@purefarm.test",
    role: "buyer",
  },
  "seller@purefarm.test": {
    id: "u-seller",
    name: "Kiran (Seller)",
    email: "seller@purefarm.test",
    role: "seller",
  },
  "admin@purefarm.test": {
    id: "u-admin",
    name: "PureFarm Admin",
    email: "admin@purefarm.test",
    role: "admin",
  },
};

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

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const normalizedKey = emailOrPhone.trim().toLowerCase();
    
    // Check credentials matching password123
    if (password === "password123" && TEST_ACCOUNTS[normalizedKey]) {
      const session = TEST_ACCOUNTS[normalizedKey];
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

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasAnyRole }}>
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
