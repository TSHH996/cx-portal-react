import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const missingConfigMessage = "Supabase is not configured.";

export function useLogin(copy) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  useEffect(() => {
    let ignore = false;

    async function redirectIfLoggedIn() {
      if (!supabase) return;
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (ignore) return;
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      if (session) navigate("/dashboard", { replace: true });
    }

    redirectIfLoggedIn();
    return () => { ignore = true; };
  }, [navigate]);

  const signIn = useCallback(async (event) => {
    event.preventDefault();
    clearMessages();
    if (!supabase) {
      setError(missingConfigMessage);
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError(copy.loginEmptyError);
      return;
    }

    try {
      setLoading(true);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
      if (loginError) {
        setError(loginError.message || copy.loginUnexpected);
        return;
      }
      if (!data?.session) {
        setError(copy.loginNoSession);
        return;
      }
      setSuccess(copy.loginSuccess);
      const target = location.state?.from || "/dashboard";
      navigate(target, { replace: true });
    } catch (loginException) {
      setError(loginException?.message || copy.loginUnexpected);
    } finally {
      setLoading(false);
    }
  }, [clearMessages, copy.loginEmptyError, copy.loginNoSession, copy.loginSuccess, copy.loginUnexpected, email, location.state?.from, navigate, password]);

  const resetPassword = useCallback(async () => {
    clearMessages();
    if (!supabase) {
      setError(missingConfigMessage);
      return;
    }
    if (!email.trim()) {
      setError(copy.loginResetNeedEmail);
      return;
    }
    try {
      setLoading(true);
      const current = window.location;
      const redirectTo = `${current.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (resetError) {
        setError(resetError.message || copy.loginResetFailed);
        return;
      }
      setSuccess(copy.loginResetSent);
    } catch (resetException) {
      setError(resetException?.message || copy.loginUnexpected);
    } finally {
      setLoading(false);
    }
  }, [clearMessages, copy.loginResetFailed, copy.loginResetNeedEmail, copy.loginResetSent, copy.loginUnexpected, email]);

  return {
    email,
    password,
    loading,
    error,
    success,
    setEmail,
    setPassword,
    signIn,
    resetPassword,
  };
}
