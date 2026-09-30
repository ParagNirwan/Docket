import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { logout } from "../lib/auth";
import { useParams } from "react-router";

type ArchivedFile = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  frozenAt: string;
};

export function ViewArchivesPage() {
  const [files, setFiles] = useState<ArchivedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { tenantId } = useParams();

  //bytes to MB
  function convertToMB(bytes:number){
        if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB"
    }
    return (bytes / 1024 / 1024).toFixed(2) + " MB"
  }

  useEffect(() => {
    async function fetchFiles() {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/documents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setFiles(data);
      setLoading(false);
    }

    fetchFiles();
  }, []);

  return (
    <>
      <div className="max-w-lg mx-auto mt-20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Archived Documents</h1>
          <button
            onClick={() => logout(navigate)}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Log out
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && files.length === 0 && (
          <p className="text-gray-500">
            You don't have any files uploaded in this Tenant.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="border rounded px-4 py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{file.fileName}</p>
                <p className="text-sm text-gray-500">{convertToMB(file.sizeBytes)}</p>
                <p className="text-sm text-gray-500">{new Date(file.frozenAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          to="/tenants"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          Dashboard
        </Link>
      </div>
    </>
  );
}
