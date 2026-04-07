import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppLayout() {
  const { activeRole, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            CourseSell App
          </Link>

          <nav className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/courses">
              Courses
            </NavLink>

            {activeRole === "user" ? (
              <NavLink to="/purchases">My Purchases</NavLink>
            ) : null}

            {activeRole === "admin" ? (
              <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
            ) : null}
          </nav>

          <div className="topbar-actions">
            {activeRole === "guest" ? (
              <>
                <Link className="btn btn-ghost" to="/auth?mode=signin">
                  Sign In
                </Link>
                <Link className="btn btn-primary" to="/auth?mode=signup">
                  Sign Up
                </Link>
              </>
            ) : null}

            {activeRole === "user" ? (
              <>
                <span className="role-pill">Signed in as User</span>
                <button className="btn btn-ghost" onClick={() => signOut("user")}>
                  Logout
                </button>
              </>
            ) : null}

            {activeRole === "admin" ? (
              <>
                <span className="role-pill">Signed in as Admin</span>
                <button className="btn btn-ghost" onClick={() => signOut("admin")}>
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="container page-content">
        <Outlet />
      </main>
    </div>
  );
}
