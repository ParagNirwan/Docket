import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Archive, Upload, Plus, Building2, Inbox } from "lucide-react";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  role: number;
};

export function TenantDashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  //const navigate = useNavigate();

  useEffect(() => {
    async function fetchTenants() {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setTenants(data);
      setLoading(false);
    }

    fetchTenants();
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-20 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Tenants</h1>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && tenants.length === 0 && (
        <p className="text-gray-500">You don't belong to any tenants yet.</p>
      )}

      <ul className="flex flex-col gap-2">
        {tenants.map((tenant) => (
          <li
            key={tenant.id}
            className="border rounded px-4 py-2 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-semibold">{tenant.name}</p>
                <p className="text-sm text-gray-500">{tenant.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to={`/tenant/${tenant.id}/review`}
                className="text-[var(--color-vault)] hover:underline text-sm flex items-center gap-1.5 font-medium"
              >
                <Inbox className="w-4 h-4" /> Review
              </Link>
              <Link
                to={`/tenant/${tenant.id}/view-archives`}
                className="text-blue-600 hover:underline text-sm flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4" /> View Files
              </Link>
              <Link
                to={`/tenant/${tenant.id}/upload`}
                className="text-blue-600 hover:underline text-sm flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" /> Upload
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <Link
        to="/create-tenant"
        className="inline-flex items-center gap-1.5 mt-4 text-blue-600 hover:underline font-medium"
      >
        <Plus className="w-4 h-4" /> Create a new tenant
      </Link>
    </div>
  );
}
