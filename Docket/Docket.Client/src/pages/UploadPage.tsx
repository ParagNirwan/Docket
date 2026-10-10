import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { Upload, ArrowLeft, Folder, Layers } from "lucide-react";

type Tray = { id: string; name: string };
type FolderType = { id: string; name: string; parentFolderId: string | null };

export function UploadPage() {
  const { tenantId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [tenantName, setTenantName] = useState<string>("");
  const [trays, setTrays] = useState<Tray[]>([]);
  const [selectedTrayId, setSelectedTrayId] = useState<string>("");
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant info
  useEffect(() => {
    async function fetchTenantName() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setTenantName(data.name);
        }
      } catch {
        // Silently fail or ignore
      }
    }

    if (tenantId) {
      fetchTenantName();
    }
  }, [tenantId]);

  // Fetch trays for the tenant
  useEffect(() => {
    async function fetchTrays() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const data: Tray[] = await response.json();
          setTrays(data);

          const trayParam = searchParams.get("trayId");
          if (trayParam && data.some((t) => t.id === trayParam)) {
            setSelectedTrayId(trayParam);
          } else if (data.length > 0) {
            setSelectedTrayId(data[0].id);
          }
        }
      } catch {
        setError("Failed to load trays.");
      }
    }

    if (tenantId) {
      fetchTrays();
    }
  }, [tenantId, searchParams]);

  // Fetch folders whenever selected tray changes
  useEffect(() => {
    async function fetchFolders() {
      if (!selectedTrayId || !tenantId) {
        setFolders([]);
        return;
      }

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders?all=true`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.ok) {
          const data: FolderType[] = await response.json();
          setFolders(data);

          const folderParam = searchParams.get("folderId");
          if (folderParam && data.some((f) => f.id === folderParam)) {
            setSelectedFolderId(folderParam);
          }
        }
      } catch {
        // Ignored
      }
    }

    fetchFolders();
  }, [tenantId, selectedTrayId, searchParams]);

  async function handleUpload() {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!selectedTrayId) {
      setError("Please select a tray.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    const folderQuery = selectedFolderId ? `?folderId=${selectedFolderId}` : "";
    const uploadUrl = `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/intake/upload${folderQuery}`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      setFile(null);
      setUploading(false);
      navigate(`/tenant/${tenantId}/view-archives`);
    } catch {
      setError("Network error occurred during upload.");
      setUploading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border border-[var(--color-line)] bg-white rounded-lg shadow-sm">
      <div className="mb-4">
        <Link
          to={`/tenant/${tenantId}/view-archives`}
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Archives
        </Link>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">
          Upload Document
        </h1>
        {tenantName && (
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Organization: {tenantName}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Tray selection */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--color-vault)]" /> Destination Tray
          </label>
          <select
            value={selectedTrayId}
            onChange={(e) => {
              setSelectedTrayId(e.target.value);
              setSelectedFolderId(""); // reset folder when tray changes
            }}
            className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-vault)]"
          >
            {trays.length === 0 && <option value="">No trays available</option>}
            {trays.map((tray) => (
              <option key={tray.id} value={tray.id}>
                {tray.name}
              </option>
            ))}
          </select>
        </div>

        {/* Folder selection */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-gray-500" /> Destination Folder
          </label>
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-vault)]"
          >
            <option value="">Root (No folder)</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                📁 {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* File input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
            Select File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm text-[var(--color-muted)] file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--color-paper)] file:text-[var(--color-ink)] hover:file:cursor-pointer"
          />
          {file && (
            <p className="text-xs text-[var(--color-muted)] mt-1.5">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Upload submit button */}
        <button
          onClick={handleUpload}
          disabled={!file || !selectedTrayId || uploading}
          className="mt-2 bg-[var(--color-vault)] text-white rounded-md px-4 py-2 hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-all"
        >
          <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload to Intake"}
        </button>
      </div>
    </div>
  );
}