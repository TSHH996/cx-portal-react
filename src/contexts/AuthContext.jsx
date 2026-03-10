/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

function formatAccountName(user) {
  const metadata = user?.user_metadata || {};
  const appMetadata = user?.app_metadata || {};
  const explicit = metadata.full_name || metadata.name || metadata.display_name || appMetadata.display_name || appMetadata.name;
  if (explicit) return explicit;

  const email = user?.email || "";
  const prefix = email.split("@")[0] || "";
  if (!prefix) return "Admin User";
  return prefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!error) {
        setSession(data.session || null);
        setUser(data.session?.user || null);
      }
      setLoading(false);
    }

    bootstrap();

    const { data: listener } = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setLoading(false);
    }) || { data: { subscription: { unsubscribe() {} } } };

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    profile: user ? {
      email: user.email || "",
      name: formatAccountName(user),
      role: "admin",
      isAdmin: true,
      id: user.id,
    } : null,
    loading,
    isAuthenticated: Boolean(session),
    isAdmin: Boolean(user),
    async signOut() {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  }), [loading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
