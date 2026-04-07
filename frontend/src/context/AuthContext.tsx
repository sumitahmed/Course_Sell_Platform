import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { AuthRole } from "../types";

const USER_TOKEN_KEY = "course_app_user_token";
const ADMIN_TOKEN_KEY = "course_app_admin_token";
const ROLE_KEY = "course_app_role";

interface AuthContextValue {
  activeRole: AuthRole;
  userToken: string | null;
  adminToken: string | null;
  signIn: (role: Exclude<AuthRole, "guest">, token?: string) => void;
  signOut: (role?: Exclude<AuthRole, "guest">) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialAuthState() {
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  const savedRole = localStorage.getItem(ROLE_KEY) as AuthRole | null;

  let activeRole: AuthRole = "guest";

  if (adminToken || savedRole === "admin") {
    activeRole = "admin";
  } else if (userToken || savedRole === "user") {
    activeRole = "user";
  }

  return {
    userToken,
    adminToken,
    activeRole
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(getInitialAuthState);

  const signIn = useCallback(
    (role: Exclude<AuthRole, "guest">, token?: string) => {
      if (role === "user") {
        localStorage.setItem(ROLE_KEY, "user");
        localStorage.removeItem(ADMIN_TOKEN_KEY);

        if (token) {
          localStorage.setItem(USER_TOKEN_KEY, token);
        }

        setState({
          activeRole: "user",
          userToken: token || localStorage.getItem(USER_TOKEN_KEY),
          adminToken: null
        });
        return;
      }

      localStorage.setItem(ROLE_KEY, "admin");
      localStorage.removeItem(USER_TOKEN_KEY);

      if (token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      }

      setState({
        activeRole: "admin",
        userToken: null,
        adminToken: token || localStorage.getItem(ADMIN_TOKEN_KEY)
      });
    },
    []
  );

  const signOut = useCallback(
    (role?: Exclude<AuthRole, "guest">) => {
      if (!role) {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        setState({ activeRole: "guest", userToken: null, adminToken: null });
        return;
      }

      if (role === "user") {
        localStorage.removeItem(USER_TOKEN_KEY);
      }

      if (role === "admin") {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }

      const nextUserToken = localStorage.getItem(USER_TOKEN_KEY);
      const nextAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

      let nextRole: AuthRole = "guest";
      if (nextAdminToken) {
        nextRole = "admin";
      } else if (nextUserToken) {
        nextRole = "user";
      }

      if (nextRole === "guest") {
        localStorage.removeItem(ROLE_KEY);
      } else {
        localStorage.setItem(ROLE_KEY, nextRole);
      }

      setState({
        activeRole: nextRole,
        userToken: nextUserToken,
        adminToken: nextAdminToken
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      activeRole: state.activeRole,
      userToken: state.userToken,
      adminToken: state.adminToken,
      signIn,
      signOut
    }),
    [state.activeRole, state.adminToken, state.userToken, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
