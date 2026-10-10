import { useEffect, useState } from "react";
import { Outlet, Link, useParams, useLocation, useSearchParams } from "react-router";
import { Inbox, Layers, Upload, ArrowLeft } from "lucide-react";

type Tray = { id: string; name: string };

export function TenantWorkspaceLayout() {
  const { tenantId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [trays, setTrays] = useState<Tray[]>([]);
  const [tenantName, setTenantName] = useState<string>("");
  const [pendingCount, setPendingCount] = useState<number>(0);

  const activeTrayId = searchParams.get("trayId") || (trays[0]?.id ?? null);
  const isReviewActive = location.pathname.includes("/review");
  const isArchivesActive = location.pathname.includes("/view-archives");

  // Fetch tenant info
  useEffect(() => {
    async function fetchTenant() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const data = await response.json();
          setTenantName(data.name);
        }
      } catch {
        // Ignored
      }
    }
    if (tenantId) fetchTenant();
  }, [tenantId]);

  // Fetch trays
  useEffect(() => {
    async function fetchTrays() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const data = await response.json();
          setTrays(data);
        }
      } catch {
        // Ignored
      }
    }
    if (tenantId) fetchTrays();
  }, [tenantId]);

  // Fetch pending review count
  useEffect(() => {
    async function fetchPendingCount() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/intake?status=Pending`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const data = await response.json();
          setPendingCount(Array.isArray(data) ? data.length : 0);
        }
      } catch {
        // Ignored
      }
    }
    if (tenantId) {
      fetchPendingCount();
      // Poll or refresh every 15 seconds
      const interval = setInterval(fetchPendingCount, 15000);
      return () => clearInterval(interval);
    }
  }, [tenantId, location.pathname]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Persistent Left Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white border border-[var(--color-line)] rounded-lg p-3 shadow-sm">
          {/* Tenant Title */}
          <div className="px-3 py-2 border-b border-[var(--color-line)] mb-3">
            <Link
              to="/tenants"
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3 h-3" /> All Tenants
            </Link>
            <p className="font-bold text-sm text-[var(--color-ink)] truncate">
              {tenantName || "Workspace"}
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {/* REVIEW: Always separate and above Trays */}
            <Link
              to={`/tenant/${tenantId}/review`}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isReviewActive
                  ? "bg-[var(--color-vault)] text-white"
                  : "text-[var(--color-ink)] hover:bg-[#F2EFE8]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Review</span>
              </div>
              {pendingCount > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isReviewActive
                      ? "bg-white text-[var(--color-vault)]"
                      : "bg-[var(--color-seal)] text-white"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </Link>

            {/* Visual Separator */}
            <div className="my-2 border-t border-[var(--color-line)]" />

            {/* TRAYS SECTION */}
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Trays
            </div>

            {trays.map((tray) => {
              const isSelected =
                isArchivesActive && (activeTrayId === tray.id || (!activeTrayId && trays[0]?.id === tray.id));

              return (
                <Link
                  key={tray.id}
                  to={`/tenant/${tenantId}/view-archives?trayId=${tray.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-[#EAE6DF] text-[var(--color-vault)] font-semibold border-l-3 border-[var(--color-vault)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[#F2EFE8]"
                  }`}
                >
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{tray.name}</span>
                </Link>
              );
            })}

            {trays.length === 0 && (
              <p className="px-3 py-2 text-xs text-[var(--color-muted)] italic">
                No trays found
              </p>
            )}

            {/* Quick Upload action */}
            <div className="mt-4 pt-3 border-t border-[var(--color-line)]">
              <Link
                to={`/tenant/${tenantId}/upload`}
                className="w-full text-xs font-medium border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[#EAE6DF] rounded-md px-3 py-2 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--color-vault)]" /> Upload File
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 min-w-0">
        <Outlet context={{ trays, refreshPendingCount: () => {} }} />
      </main>
    </div>
  );
}

