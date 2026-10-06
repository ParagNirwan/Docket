//use location is a hook that gives the entire url as an Object
//It will be helpful to highlight what nav link is active
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { logout } from "../lib/auth";
import { LayoutDashboard, User, LogOut, Library } from "lucide-react";
export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { to: "/tenants", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-1.5 inline" /> },
    { to: "/account", label: "Account Settings", icon: <User className="w-4 h-4 mr-1.5 inline" /> },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-semibold text-lg flex items-center gap-2"><Library className="w-5 h-5 text-[var(--color-vault)]"/> Docket</span>
          <nav className="flex gap-4">
            {" "}
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  location.pathname === item.to
                    ? "text-sm font-medium text-[var(--color-vault)] border-b-2 border-[var(--color-vault)] pb-1 flex items-center"
                    : "text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] pb-1 flex items-center"
                }
              >
                {" "}
                {item.icon}{item.label}{" "}
              </Link>
            ))}{" "}
          </nav>
          <button
            onClick={() => logout(navigate)}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-danger)] flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1.5 inline" /> Log out
          </button>{" "}
        </div>{" "}
      </header>{" "}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {" "}
        <Outlet />{" "}
      </main>{" "}
    </div>
  );
}
