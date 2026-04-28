import { useState } from "react";

function AuthScreen({ auth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const submitLabel = mode === "login" ? "Sign In" : "Create Account";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("error");

    try {
      if (mode === "login") {
        await auth.login(form.email, form.password);
      } else {
        await auth.register(form.email, form.password);
        setMessageType("success");
        setMessage("Account created. Please sign in to continue.");
        setMode("login");
        setForm((previous) => ({ ...previous, password: "" }));
      }
    } catch (error) {
      setMessage(error.message || "Authentication failed.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-screen rise-in">
      <article className="auth-card">
        <p className="eyebrow">Secure Wallet</p>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted auth-copy">
          Your budget, bills, and goals will be stored against your real Firebase user account.
        </p>

        <div className="auth-toggle" role="tablist" aria-label="Authentication options">
          <button
            type="button"
            className={mode === "login" ? "auth-toggle-active" : "auth-toggle-button"}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === "signup" ? "auth-toggle-active" : "auth-toggle-button"}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label htmlFor="authEmail">Email</label>
          <input
            id="authEmail"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
            required
          />

          <label htmlFor="authPassword">Password</label>
          <input
            id="authPassword"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength="6"
            value={form.password}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, password: event.target.value }))
            }
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : submitLabel}
          </button>
        </form>

        {message && (
          <p className={messageType === "success" ? "status-banner auth-feedback" : "status-banner error auth-feedback"}>
            {message}
          </p>
        )}
        {auth.error && !message && <p className="status-banner error auth-feedback">{auth.error}</p>}

        <div className="auth-note">
          <strong>First-time Firebase setup:</strong>
          <span>Enable Email/Password sign-in in the Firebase console before using this screen.</span>
        </div>
      </article>
    </section>
  );
}

export default AuthScreen;
