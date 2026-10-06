import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { Upload } from "lucide-react";

type Tray = { id: string; name: string };

export function UploadPage() {
  const { tenantId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState();
  const [trays, setTrays] = useState<Tray[]>([]);
  const [selectedTrayId, setSelectedTrayId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenantName() {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setTenantName(data.name);
    }

    fetchTenantName();
  }, [tenantId]);

  useEffect(() => {
    async function fetchTrays() {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setTrays(data);
      if (data.length > 0) {
        setSelectedTrayId(data[0].id);
      }
    }
    fetchTrays();
  }, [tenantId]);

  async function handleUpload() {
    if (!file) return;
    if (!selectedTrayId) return;

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/documents/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );
    if (!response.ok) {
      alert("Upload failed");
      return;
    }
    setFile(null);
    navigate(`/tenant/${tenantId}/view-archives`);
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Upload File for {tenantName}</h1>

      <div className="flex flex-col gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={handleUpload}
          disabled={!file}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>
    </div>
  );
}