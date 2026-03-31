import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Typed from "typed.js";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const typedRef = useRef(null);
  const typedInstance = useRef(null);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  useEffect(() => {
    if (!typedRef.current) return;
    typedInstance.current = new Typed(typedRef.current, {
      strings: ["Track units.", "Know your bill.", "Tamil Nadu tariffs."],
      typeSpeed: 45,
      backSpeed: 25,
      loop: true,
    });
    return () => typedInstance.current?.destroy();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="login-orb absolute -left-20 top-20 h-72 w-72 rounded-full bg-amber-500 blur-[100px]" />
        <div className="login-orb login-orb-delay absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/50 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center text-2xl shadow-lg">
            <img src="./logo.png" alt="PoweLogLogo" className="h-[40px]" />
          </div>

          <h1 className="text-2xl font-black text-white">TN PowerLog</h1>
          <p className="mt-2 min-h-[1.75rem] text-sm text-amber-100">
            <span ref={typedRef} className="inline-block min-h-[1.25rem]" />
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-600 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-amber-500"
            />
          </div>
          {err && (
            <p className="rounded-lg bg-red-950/80 px-3 py-2 text-sm text-red-200">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 font-bold text-slate-950 shadow-lg transition hover:from-amber-400 disabled:opacity-50"
          >
            {loading ? "…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setErr("");
          }}
          className="mt-4 w-full text-center text-sm text-slate-400 underline hover:text-white"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
}
