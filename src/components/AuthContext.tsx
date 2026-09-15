import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProfile, upsertProfile } from "@/services/profiles";
import type { UserRole } from "@/types/database";

export type { UserRole };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  location?: string | null;
  avatar_url?: string | null;
}

export interface SignupInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "farmer" | "buyer" | "student";
  location?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (input: SignupInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_FALLBACK_SESSION_KEY = "purefarm_local_auth_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync profile from Supabase
  const loadUserProfile = async (authUserId: string, authEmail?: string, authMetadata?: Record<string, any>): Promise<UserSession | null> => {
    try {
      let profile = await getProfile(authUserId);

      // If profile is missing in profiles table, create it from auth metadata
      if (!profile && isSupabaseConfigured) {
        const metadataRole = authMetadata?.["role"];
        const safeRole: UserRole = (metadataRole === "buyer" || metadataRole === "student" || metadataRole === "admin" || metadataRole === "seller") ? metadataRole : "farmer";
        
        profile = await upsertProfile({
          id: authUserId,
          full_name: authMetadata?.["full_name"] || authMetadata?.["name"] || authEmail?.split("@")[0] || "PureFarm User",
          email: authEmail || null,
          phone: authMetadata?.["phone"] || null,
          role: safeRole,
          location: authMetadata?.["location"] || null,
        });
      }

      if (profile) {
        const session: UserSession = {
          id: profile.id,
          name: profile.full_name,
          email: profile.email || authEmail || "",
          phone: profile.phone,
          role: profile.role,
          location: profile.location,
          avatar_url: profile.avatar_url,
        };
        return session;
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }

    // Fallback if metadata is available
    if (authEmail) {
      return {
        id: authUserId,
        name: authMetadata?.["full_name"] || authMetadata?.["name"] || authEmail.split("@")[0],
        email: authEmail,
        phone: authMetadata?.["phone"] || null,
        role: (authMetadata?.["role"] as UserRole) || "farmer",
        location: authMetadata?.["location"] || null,
      };
    }

    return null;
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Error fetching Supabase session:", error.message);
          }

          if (session?.user && mounted) {
            const userSession = await loadUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata
            );
            if (mounted) setUser(userSession);
          } else if (mounted) {
            const stored = typeof window !== "undefined" ? window.localStorage.getItem(LOCAL_FALLBACK_SESSION_KEY) : null;
            if (stored) {
              try {
                setUser(JSON.parse(stored));
              } catch {
                window.localStorage.removeItem(LOCAL_FALLBACK_SESSION_KEY);
              }
            }
          }
        } catch (err) {
          console.error("Failed to initialize auth session:", err);
        }
      } else {
        // Fallback for offline/local development when Supabase URL is not configured
        if (typeof window !== "undefined") {
          const stored = window.localStorage.getItem(LOCAL_FALLBACK_SESSION_KEY);
          if (stored) {
            try {
              if (mounted) setUser(JSON.parse(stored));
            } catch {
              window.localStorage.removeItem(LOCAL_FALLBACK_SESSION_KEY);
            }
          }
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Supabase auth state change listener
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (session?.user) {
            const userSession = await loadUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata
            );
            if (mounted) setUser(userSession);
          }
        } else if (event === "SIGNED_OUT") {
          if (mounted) setUser(null);
        }
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signup = async (input: SignupInput): Promise<AuthResponse> => {
    const { name, email, phone, password, role, location } = input;

    // Security check: Force public signups to be farmer, buyer, or student
    const safeRole: "farmer" | "buyer" | "student" = (role === "buyer" || role === "student") ? role : "farmer";

    if (!email || !password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
              role: safeRole,
              location: location?.trim() || "",
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Explicitly ensure profile is stored in public.profiles table
          try {
            await upsertProfile({
              id: data.user.id,
              full_name: name.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              role: safeRole,
              location: location?.trim() || null,
            });
          } catch (profileErr: any) {
            console.warn("Could not immediately upsert profile:", profileErr?.message);
          }

          const userSession: UserSession = {
            id: data.user.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            role: safeRole,
            location: location?.trim() || null,
          };

          setUser(userSession);
          return { success: true, role: safeRole };
        }

        return { success: true, role: safeRole };
      } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred during signup." };
      }
    } else {
      // Offline fallback
      const mockId = "u-" + Math.random().toString(36).substring(2, 10);
      const userSession: UserSession = {
        id: mockId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: safeRole,
        location: location?.trim() || null,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_FALLBACK_SESSION_KEY, JSON.stringify(userSession));
      }
      setUser(userSession);
      return { success: true, role: safeRole };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return { success: false, error: "Please enter both email and password." };
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: "No user returned from authentication." };
        }

        // Fetch real role from public.profiles table
        const userSession = await loadUserProfile(
          data.user.id,
          data.user.email,
          data.user.user_metadata
        );

        if (userSession) {
          setUser(userSession);
          return { success: true, role: userSession.role };
        }

        return { success: true, role: "farmer" };
      } catch (err: any) {
        return { success: false, error: err.message || "Invalid credentials." };
      }
    } else {
      // Local development fallback
      let fallbackRole: UserRole = "farmer";
      if (normalizedEmail.includes("buyer")) fallbackRole = "buyer";
      else if (normalizedEmail.includes("student")) fallbackRole = "student";
      else if (normalizedEmail.includes("admin")) fallbackRole = "admin";
      else if (normalizedEmail.includes("seller")) fallbackRole = "seller";

      const userSession: UserSession = {
        id: "u-dev-" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, ""),
        name: (normalizedEmail.split("@")[0] || "USER").toUpperCase(),
        email: normalizedEmail,
        role: fallbackRole,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_FALLBACK_SESSION_KEY, JSON.stringify(userSession));
      }
      setUser(userSession);
      return { success: true, role: fallbackRole };
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error signing out from Supabase:", err);
      }
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCAL_FALLBACK_SESSION_KEY);
      window.localStorage.removeItem("purefarm_session");
    }
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const refreshed = await getProfile(user.id);
      if (refreshed) {
        setUser({
          id: refreshed.id,
          name: refreshed.full_name,
          email: refreshed.email || user.email,
          phone: refreshed.phone,
          role: refreshed.role,
          location: refreshed.location,
          avatar_url: refreshed.avatar_url,
        });
      }
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        hasRole,
        hasAnyRole,
        refreshProfile,
      }}
    >
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
