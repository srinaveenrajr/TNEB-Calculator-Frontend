import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  [
    "relative px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
    "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80",
    isActive
      ? "!text-amber-700 bg-amber-100/90 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.2)]"
      : "",
  ].join(" ");

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed  top-0 z-50 w-full border-b border-slate-200 bg-white h-[70px] md:h-[90px]">
      <div className="mx-auto flex h-[var(--app-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 mt-2 md:mt-5 sm:px-6">
        <NavLink to="/" className="group flex shrink-0 items-center gap-2" end>
          <img src="./logo.png" alt="PoweLogLogo" className="h-[40px]" />
          <div className="hidden leading-tight sm:block">
            <span className="block text-[25px] font-bold tracking-tight text-slate-900">
              TN PowerLog
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              {user?.email || "Meter & slabs"}
            </span>
          </div>
        </NavLink>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-[15px] font-semibold text-slate-700 hover:bg-slate-100"
          >
            Log out
          </button>
          <nav
            className="flex flex-wrap items-center justify-end gap-1 sm:gap-2"
            aria-label="Main"
          >
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
