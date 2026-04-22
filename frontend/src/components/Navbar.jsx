import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm ${isActive ? "bg-civicGreen text-white" : "text-civicGreen hover:bg-green-100"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white border-b border-green-100 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-civicGreen font-bold text-xl">
          CivicBridge
        </Link>
        <div className="flex flex-wrap gap-2 items-center">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            Report Issue
          </NavLink>
          <NavLink to="/feed" className={navLinkClass}>
            Community Feed
          </NavLink>
          <NavLink to="/heatmap" className={navLinkClass}>
            Heatmap
          </NavLink>
          <NavLink to="/donate" className={navLinkClass}>
            Donate
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-2 rounded-md text-sm text-civicGreen hover:bg-green-100"
              type="button"
            >
              Logout ({user.anonymous_id})
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
