//use location is a hook that gives the entire url as an Object
//It will be helpful to highlight what nav link is active
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { logout } from "../lib/auth";
export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { to: "/tenants", label: "Dashboard" },
    { to: "/account", label: "Account Settings" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-line)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-semibold text-lg">Docket</span>
          <nav className="flex gap-4">
            {" "}
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  location.pathname === item.to
                    ? "text-sm font-medium text-[var(--color-vault)] border-b-2 border-[var(--color-vault)] pb-1"
                    : "text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] pb-1"
                }
              >
                {" "}
                {item.label}{" "}
              </Link>
            ))}{" "}
          </nav>
          <button
            onClick={() => logout(navigate)}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-danger)]"
          >
            Log out
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
