import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const links = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report Issue" },
  { to: "/feed", label: "Community Feed" },
  { to: "/heatmap", label: "Heatmap" },
  { to: "/donate", label: "Donate" }
];

const navLinkClass = ({ isActive }) =>
  `relative px-2 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:text-civicGreen ${
    isActive
      ? "text-civicDark after:absolute after:bottom-0 after:left-2 after:h-0.5 after:w-[calc(100%-1rem)] after:rounded-full after:bg-civicGreen"
      : "text-emerald-800"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = (
    <>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setOpen(false)}>
          {link.label}
        </NavLink>
      ))}
      {user && (
        <NavLink to="/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>
          Dashboard
        </NavLink>
      )}
    </>
  );

  return (
    <nav className="glass-nav sticky top-0 z-30 border-b border-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="group flex items-center gap-2 text-civicDark">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-civicGreen to-teal-500 text-white shadow-lg shadow-emerald-900/20 transition group-hover:rotate-3">
            <Icon name="bridge" className="h-6 w-6" />
          </span>
          <span className="text-xl font-black tracking-tight">CivicBridge</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems}
          {!user ? (
            <>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <Link to="/register" className="brand-button rounded-full px-4 py-2 text-sm font-black text-white">
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-civicGreen transition hover:-translate-y-0.5 hover:bg-emerald-50"
              type="button"
            >
              Logout ({user.anonymous_id})
            </button>
          )}
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/80 text-civicGreen shadow lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          <Icon name={open ? "x" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="border-t border-emerald-100 bg-white/95 px-4 py-4 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {navItems}
            {!user ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="rounded-xl bg-emerald-50 px-4 py-3 text-center font-bold text-civicGreen" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="brand-button rounded-xl px-4 py-3 text-center font-bold text-white" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 text-left font-bold text-civicGreen"
                type="button"
              >
                Logout ({user.anonymous_id})
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
