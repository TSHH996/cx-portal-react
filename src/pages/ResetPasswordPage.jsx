import { useAppShell } from "../contexts/AppShellContext";
import { useResetPassword } from "../features/auth/useResetPassword";

function ResetPasswordPage() {
  const { copy, brandTitle } = useAppShell();
  const { password, confirmPassword, loading, error, success, ready, setPassword, setConfirmPassword, submit } = useResetPassword(copy);

  return (
    <div className="loginPageReact">
      <div className="loginShellReact resetShellReact">
        <section className="loginHeroReact">
          <div className="brand-row loginBrandRow">
            <div className="logo-mark loginLogoMark">CX</div>
            <div className="loginBrandText">
              <div className="eyebrow-text">{copy.brandEyebrow}</div>
              <div className="brand-title">{brandTitle}</div>
              <div className="brand-subtitle">{copy.brandSub}</div>
            </div>
          </div>
          <div className="loginHeroContent">
            <div className="loginHeroEyebrow">{copy.resetPasswordTitle}</div>
            <h1>{copy.resetPasswordTitle}</h1>
            <p>{copy.resetPasswordSub}</p>
          </div>
        </section>

        <section className="loginPanelReact">
          <div className="loginFormCard">
            <div className="loginFormHead">
              <div className="loginMiniLogo">CX</div>
              <h2>{copy.resetPasswordTitle}</h2>
              <p>{copy.resetPasswordSub}</p>
            </div>

            <form className="loginFormReact" onSubmit={submit}>
              <div className="loginField">
                <label htmlFor="reset-password">{copy.resetPasswordLabel}</label>
                <input id="reset-password" className="loginInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={copy.resetPasswordPlaceholder} disabled={loading || !ready} required />
              </div>
              <div className="loginField">
                <label htmlFor="reset-confirm">{copy.resetPasswordConfirmLabel}</label>
                <input id="reset-confirm" className="loginInput" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={copy.resetPasswordConfirmPlaceholder} disabled={loading || !ready} required />
              </div>

              {error ? <div className="loginMessage error">{error}</div> : null}
              {success ? <div className="loginMessage success">{success}</div> : null}

              <button className="loginSubmitBtn" type="submit" disabled={loading || !ready}>{loading ? copy.resetPasswordSubmitting : copy.resetPasswordSubmit}</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
