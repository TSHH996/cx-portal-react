import { useAppShell } from "../contexts/AppShellContext";
import { useLogin } from "../features/auth/useLogin";

function LoginPage() {
  const { copy, brandTitle } = useAppShell();
  const { email, password, loading, error, success, setEmail, setPassword, signIn, resetPassword } = useLogin(copy);

  return (
    <div className="loginPageReact">
      <div className="loginShellReact">
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
            <div className="loginHeroEyebrow">{copy.loginHeroEyebrow}</div>
            <h1>{copy.loginHeroTitle}</h1>
            <p>{copy.loginHeroText}</p>

            <div className="loginHeroStats">
              <div className="loginHeroStat"><div className="v">60+</div><div className="l">{copy.loginStatBranches}</div></div>
              <div className="loginHeroStat"><div className="v">SLA</div><div className="l">{copy.loginStatSla}</div></div>
              <div className="loginHeroStat"><div className="v">Reply</div><div className="l">{copy.loginStatReply}</div></div>
              <div className="loginHeroStat"><div className="v">Live</div><div className="l">{copy.loginStatLive}</div></div>
            </div>
          </div>

          <div className="loginHeroFooter">
            <span className="soft-badge">{copy.loginBadgeAuth}</span>
            <span className="soft-badge">{copy.loginBadgeAccess}</span>
            <span className="soft-badge">{copy.loginBadgeUi}</span>
          </div>
        </section>

        <section className="loginPanelReact">
          <div className="loginFormCard">
            <div className="loginFormHead">
              <div className="loginMiniLogo">CX</div>
              <h2>{copy.loginTitle}</h2>
              <p>{copy.loginSub}</p>
            </div>

            <form className="loginFormReact" onSubmit={signIn}>
              <div className="loginField">
                <label htmlFor="login-email">{copy.loginEmailLabel}</label>
                <input id="login-email" className="loginInput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={copy.loginEmailPlaceholder} autoComplete="email" disabled={loading} required />
              </div>

              <div className="loginField">
                <label htmlFor="login-password">{copy.loginPasswordLabel}</label>
                <input id="login-password" className="loginInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={copy.loginPasswordPlaceholder} autoComplete="current-password" disabled={loading} required />
              </div>

              {error ? <div className="loginMessage error">{error}</div> : null}
              {success ? <div className="loginMessage success">{success}</div> : null}

              <button className="loginSubmitBtn" type="submit" disabled={loading}>{loading ? copy.loginSubmitting : copy.loginSubmit}</button>

              <div className="loginHelperText">{copy.loginHelper}</div>

              <div className="loginBottomRow">
                <button className="loginTextBtn" type="button" onClick={resetPassword} disabled={loading}>{copy.loginForgot}</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
