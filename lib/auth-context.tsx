"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";
import { store } from "@/lib/store";
import { homePathForRole } from "@/lib/utils";

const SESSION_KEY = "dn:session";

export interface Session {
  user_id: string;
  token: string;
  role: Role;
  jurisdiction_id: string;
  jurisdiction_name: string;
  full_name: string;
}

interface AuthValue {
  session: Session | null;
  isLoading: boolean;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (username: string, password: string) => {
      const users = store.users();
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (!user) return { ok: false, error: "Invalid username or password" };
      if (!user.is_active)
        return { ok: false, error: "This account is disabled. Contact your administrator." };

      const next: Session = {
        user_id: user.id,
        token: "mock-jwt-" + Math.random().toString(36).slice(2),
        role: user.role,
        jurisdiction_id: user.jurisdiction_id,
        jurisdiction_name: user.jurisdiction_name,
        full_name: user.full_name,
      };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      // record last_login
      store.setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, last_login: new Date().toISOString(), failed_logins: 0 }
            : u
        )
      );
      setSession(next);
      router.push(homePathForRole(user.role));
      return { ok: true };
    },
    [router]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ session, isLoading, login, logout }),
    [session, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
