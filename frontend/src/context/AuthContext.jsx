import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi, getErrorMessage, userApi } from "../services/api";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = "ghartak-token";
const USER_KEY = "ghartak-user";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  useEffect(() => {
    window.addEventListener("ghartak:unauthorized", logout);
    return () => window.removeEventListener("ghartak:unauthorized", logout);
  }, [logout]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    userApi
      .profile()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(async (credentials, expectedRole) => {
    const { data } = await authApi.login(credentials);
    if (expectedRole && data.user.role !== expectedRole) {
      throw new Error(
        expectedRole === "shop_owner"
          ? "This account is not registered as a shop owner."
          : "This account is not registered as a customer."
      );
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    try {
      return await authApi.register(details);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, register, updateUser }),
    [user, loading, login, logout, register, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
