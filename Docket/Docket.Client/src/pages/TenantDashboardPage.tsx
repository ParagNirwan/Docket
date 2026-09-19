import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { logout } from "../lib/auth";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  role: number;
};

export function TenantDashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        <button
          onClick={() => logout(navigate)}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Log out
        </button>
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
            <div>
              <p className="font-semibold">{tenant.name}</p>
              <p className="text-sm text-gray-500">{tenant.slug}</p>
            </div>
            <Link
              to={`/tenant/${tenant.id}/view-archives`}
              className="text-blue-600 hover:underline text-sm"
            >
              View Files
            </Link>
            <Link
              to={`/tenant/${tenant.id}/upload`}
              className="text-blue-600 hover:underline text-sm"
            >
              Upload
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/create-tenant"
        className="inline-block mt-4 text-blue-600 hover:underline"
      >
        + Create a new tenant
      </Link>
    </div>
  );
}
