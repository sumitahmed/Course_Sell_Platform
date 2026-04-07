import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminSignin, adminSignup } from "../api/adminApi";
import { ApiError } from "../api/client";
import { MessageBanner } from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";

type Mode = "signin" | "signup";

interface AuthFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const initialFormState: AuthFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

export function AdminAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();

  const initialMode: Mode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState<AuthFormState>(initialFormState);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  function updateField(field: keyof AuthFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      if (mode === "signup") {
        const response = await adminSignup({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName
        });

        setStatusMessage(response.message || "Admin signup successful. Please sign in.");
        setMode("signin");
        setForm((current) => ({
          ...current,
          password: ""
        }));
      } else {
        const response = await adminSignin({
          email: form.email,
          password: form.password
        });

        signIn("admin", response.token);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Authentication failed.";
      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="section-header">
        <h1>Admin Access</h1>
        <p>Sign in to manage your courses or create a new admin account.</p>
        <p>
          <Link className="back-link" to="/auth">
            Switch account type
          </Link>
        </p>
      </div>

      <div className="card auth-card">
        <div className="auth-toggle">
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <MessageBanner variant="success" message={statusMessage} />
        <MessageBanner variant="error" message={errorMessage} />

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <>
              <label>
                First Name
                <input
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  required
                />
              </label>

              <label>
                Last Name
                <input
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  required
                />
              </label>
            </>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
            />
          </label>

          <button className="btn btn-primary" disabled={busy} type="submit">
            {busy
              ? "Please wait..."
              : mode === "signin"
                ? "Sign In"
                : "Create Admin Account"}
          </button>
        </form>
      </div>
    </section>
  );
}
