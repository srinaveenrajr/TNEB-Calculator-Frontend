/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setToken, getToken } from "../api/client";
import { useDispatch } from "react-redux";
import { setUser as setUserInStore, setReady as setReadyInStore, logout as logoutInStore } from "../store/authSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  const loadMe = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      dispatch(setUserInStore(null));
      setReady(true);
      dispatch(setReadyInStore(true));
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      dispatch(setUserInStore(data));
    } catch {
      setToken(null);
      setUser(null);
      dispatch(setUserInStore(null));
    } finally {
      setReady(true);
      dispatch(setReadyInStore(true));
    }
  }, [dispatch]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    dispatch(setUserInStore(data.user));
    return data;
  };

  const register = async (email, password) => {
    const { data } = await api.post("/auth/register", { email, password });
    setToken(data.token);
    setUser(data.user);
    dispatch(setUserInStore(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    dispatch(logoutInStore());
  };

  const refreshUser = loadMe;

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
