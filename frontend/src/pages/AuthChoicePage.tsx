import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminSignin, adminSignup } from "../api/adminApi";
import { ApiError } from "../api/client";
import { userSignin, userSignup } from "../api/userApi";
import { MessageBanner } from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";

type RoleType = "user" | "admin";

interface GoogleProfile {
  email: string;
  given_name?: string;
  family_name?: string;
  sub: string;
}

function decodeGoogleCredential(credential: string): GoogleProfile {
  const payloadPart = credential.split(".")[1];

  if (!payloadPart) {
    throw new Error("Invalid Google credential payload");
  }

  const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = window.atob(padded);
  const payload = JSON.parse(decoded) as Partial<GoogleProfile>;

  if (!payload.email || !payload.sub) {
    throw new Error("Google account payload is missing required fields");
  }

  return {
    email: payload.email,
    sub: payload.sub,
    given_name: payload.given_name,
    family_name: payload.family_name
  };
}

function buildGooglePassword(profile: GoogleProfile) {
  return `google_${profile.sub}_course_sell`;
}

export function AuthChoicePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const roleParam = searchParams.get("role");
  const role = roleParam === "user" || roleParam === "admin" ? roleParam : "";
  const secondaryMode = mode === "signin" ? "signup" : "signin";
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());

  const [busyRole, setBusyRole] = useState<RoleType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const userPrimaryLink = `/user/auth?mode=${mode}`;
  const adminPrimaryLink = `/admin/auth?mode=${mode}`;
  const userSecondaryLink = `/user/auth?mode=${secondaryMode}`;
  const adminSecondaryLink = `/admin/auth?mode=${secondaryMode}`;

  async function continueUserWithGoogle(profile: GoogleProfile) {
    const password = buildGooglePassword(profile);
    const firstName = profile.given_name || "Google";
    const lastName = profile.family_name || "User";

    if (mode === "signin") {
      try {
        const signinResponse = await userSignin({
          email: profile.email,
          password
        });

        signIn("user", signinResponse.token);
        navigate("/purchases", { replace: true });
        return;
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 403)) {
          throw error;
        }
      }
    }

    try {
      await userSignup({
        email: profile.email,
        password,
        firstName,
        lastName
      });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 409)) {
        throw error;
      }
    }

    const signinResponse = await userSignin({
      email: profile.email,
      password
    });

    signIn("user", signinResponse.token);
    navigate("/purchases", { replace: true });
  }

  async function continueAdminWithGoogle(profile: GoogleProfile) {
    const password = buildGooglePassword(profile);
    const firstName = profile.given_name || "Google";
    const lastName = profile.family_name || "Admin";

    if (mode === "signin") {
      try {
        const signinResponse = await adminSignin({
          email: profile.email,
          password
        });

        signIn("admin", signinResponse.token);
        navigate("/admin/dashboard", { replace: true });
        return;
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 403)) {
          throw error;
        }
      }
    }

    try {
      await adminSignup({
        email: profile.email,
        password,
        firstName,
        lastName
      });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 409)) {
        throw error;
      }
    }

    const signinResponse = await adminSignin({
      email: profile.email,
      password
    });

    signIn("admin", signinResponse.token);
    navigate("/admin/dashboard", { replace: true });
  }

  async function handleGoogleSuccess(roleType: RoleType, credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      setErrorMessage("Google authentication did not return a valid token.");
      return;
    }

    setBusyRole(roleType);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const profile = decodeGoogleCredential(credentialResponse.credential);

      if (roleType === "user") {
        await continueUserWithGoogle(profile);
      } else {
        await continueAdminWithGoogle(profile);
      }

      setStatusMessage("Google authentication successful.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Google authentication failed.";
      setErrorMessage(message);
    } finally {
      setBusyRole(null);
    }
  }

  return (
    <section className="auth-choice-shell">
      <div className="auth-choice-header card">
        <div className="auth-choice-title-block">
          <p className="eyebrow">Authentication Portal</p>
          <h1>Choose Account Type</h1>
          <p>
            Select your role first. Continue with email/password or Google {mode === "signin" ? "sign in" : "sign up"}.
          </p>

          <div className="mode-switch">
            <Link
              className={`mode-chip ${mode === "signin" ? "mode-chip-active" : ""}`}
              to={role ? `/auth?mode=signin&role=${role}` : "/auth?mode=signin"}
            >
              Sign In
            </Link>
            <Link
              className={`mode-chip ${mode === "signup" ? "mode-chip-active" : ""}`}
              to={role ? `/auth?mode=signup&role=${role}` : "/auth?mode=signup"}
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="auth-choice-header-actions">
          <Link className="btn btn-ghost" to="/courses">
            Browse Courses
          </Link>
          <Link className="btn btn-ghost" to="/">
            Back to Home
          </Link>
        </div>
      </div>

      <MessageBanner variant="success" message={statusMessage} />
      <MessageBanner variant="error" message={errorMessage} />

      <div className="auth-choice-grid">
        <article className={`card choice-card choice-card-rich ${role === "user" ? "choice-card-highlight" : ""}`}>
          <div className="choice-title-row">
            <span className="choice-icon">U</span>
            <h3>User Account</h3>
            <span className="choice-tag">Learner</span>
          </div>
          <p className="muted-text">Buy courses, track your purchases, and continue lessons from your dashboard.</p>

          <div className="choice-actions">
            <Link className="btn btn-primary" to={userPrimaryLink}>
              {mode === "signin" ? "User Sign In" : "User Sign Up"}
            </Link>
            <Link className="btn btn-ghost" to={userSecondaryLink}>
              {mode === "signin" ? "User Sign Up Instead" : "User Sign In Instead"}
            </Link>
          </div>

          <div className="google-panel">
            <p className="google-caption">Continue with Google</p>
            {hasGoogleClientId ? (
              <>
                <GoogleLogin
                  onSuccess={(response) => {
                    void handleGoogleSuccess("user", response);
                  }}
                  onError={() => {
                    setErrorMessage("Google popup failed. Please retry.");
                  }}
                  shape="pill"
                  text={mode === "signin" ? "signin_with" : "signup_with"}
                  width="280"
                />
                {busyRole === "user" ? <p className="muted-text small-note">Processing Google account...</p> : null}
              </>
            ) : (
              <p className="muted-text small-note">Set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google auth.</p>
            )}
          </div>
        </article>

        <article className={`card choice-card choice-card-rich ${role === "admin" ? "choice-card-highlight" : ""}`}>
          <div className="choice-title-row">
            <span className="choice-icon">A</span>
            <h3>Admin Account</h3>
            <span className="choice-tag">Instructor</span>
          </div>
          <p className="muted-text">Create courses, manage lessons, and update your catalog as an instructor.</p>

          <div className="choice-actions">
            <Link className="btn btn-primary" to={adminPrimaryLink}>
              {mode === "signin" ? "Admin Sign In" : "Admin Sign Up"}
            </Link>
            <Link className="btn btn-ghost" to={adminSecondaryLink}>
              {mode === "signin" ? "Admin Sign Up Instead" : "Admin Sign In Instead"}
            </Link>
          </div>

          <div className="google-panel">
            <p className="google-caption">Continue with Google</p>
            {hasGoogleClientId ? (
              <>
                <GoogleLogin
                  onSuccess={(response) => {
                    void handleGoogleSuccess("admin", response);
                  }}
                  onError={() => {
                    setErrorMessage("Google popup failed. Please retry.");
                  }}
                  shape="pill"
                  text={mode === "signin" ? "signin_with" : "signup_with"}
                  width="280"
                />
                {busyRole === "admin" ? <p className="muted-text small-note">Processing Google account...</p> : null}
              </>
            ) : (
              <p className="muted-text small-note">Set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google auth.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
