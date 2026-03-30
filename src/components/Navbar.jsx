import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  [
    "relative px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
    "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80",
    "dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5",
    isActive
      ? "!text-amber-700 bg-amber-100/90 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.2)] dark:!text-amber-400 dark:bg-amber-400/10 dark:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)]"
      : "",
  ].join(" ");

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex h-[var(--app-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavLink to="/" className="group flex shrink-0 items-center gap-2" end>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-lg shadow-md dark:shadow-amber-900/30"
            aria-hidden
          >
            ⚡
          </span>
          <div className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              EB Toolkit
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-500">
              {user?.email || "Meter & slabs"}
            </span>
          </div>
        </NavLink>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Log out
          </button>
          <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2" aria-label="Main">
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
