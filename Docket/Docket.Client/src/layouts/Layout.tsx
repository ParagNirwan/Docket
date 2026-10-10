import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { logout } from "../lib/auth";
import { Library, LogOut, Settings, UserCircle } from "lucide-react";
import { useState } from "react";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans">
      <header className="bg-white border-b border-[var(--color-line)] shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/tenants" className="font-semibold text-lg flex items-center gap-2 text-[var(--color-ink)] hover:opacity-80">
              <Library className="w-6 h-6 text-[var(--color-vault)]"/> Docket
            </Link>
            
            <nav className="hidden md:flex gap-6">
              <Link
                to="/tenants"
                className={`text-sm font-medium flex items-center transition-colors ${
                  location.pathname === "/tenants" || location.pathname.startsWith("/tenant/")
                    ? "text-[var(--color-vault)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-[var(--color-line)] transition-all"
            >
              <div className="w-9 h-9 bg-[var(--color-vault)] rounded-full flex items-center justify-center text-white overflow-hidden shadow-sm">
                <UserCircle className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </button>
            
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[var(--color-line)] rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--color-line)] bg-[var(--color-paper)]">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">Signed In</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/settings" 
                      className="px-4 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] flex items-center transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </Link>
                  </div>
                  <div className="border-t border-[var(--color-line)] py-1">
                    <button
                      onClick={() => { setProfileOpen(false); logout(navigate); }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[#fff5f5] flex items-center transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
