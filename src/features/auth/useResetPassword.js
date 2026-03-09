import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function useResetPassword(copy) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function validateSession() {
      if (!supabase) {
        if (mounted) setError(copy.resetPasswordInvalidSession);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        setError(copy.resetPasswordInvalidSession);
        return;
      }
      setReady(true);
    }
    validateSession();
    return () => { mounted = false; };
  }, [copy.resetPasswordInvalidSession]);

  const submit = useCallback(async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError(copy.resetPasswordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.resetPasswordMismatch);
      return;
    }

    try {
      setLoading(true);
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || copy.loginUnexpected);
        return;
      }
      setSuccess(copy.resetPasswordSuccess);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (updateException) {
      setError(updateException?.message || copy.loginUnexpected);
    } finally {
      setLoading(false);
    }
  }, [confirmPassword, copy.loginUnexpected, copy.resetPasswordMismatch, copy.resetPasswordSuccess, copy.resetPasswordTooShort, navigate, password]);

  return { password, confirmPassword, loading, error, success, ready, setPassword, setConfirmPassword, submit };
}
