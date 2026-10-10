import { Outlet, Link, useLocation } from "react-router";
import { User, Settings, Building2 } from "lucide-react";

export function SettingsLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/settings/profile", label: "Profile", icon: <User className="w-4 h-4 mr-2 inline" /> },
    { to: "/settings/app", label: "App Settings", icon: <Settings className="w-4 h-4 mr-2 inline" /> },
    { to: "/settings/tenant", label: "Tenant Settings", icon: <Building2 className="w-4 h-4 mr-2 inline" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-ink)]">Settings</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-md flex items-center text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-vault)] text-white"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg shadow-sm p-6">
        <Outlet />
      </main>
    </div>
  );
}

