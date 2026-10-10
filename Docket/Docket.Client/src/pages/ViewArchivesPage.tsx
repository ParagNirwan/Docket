import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Folder, File, FolderPlus, Upload } from "lucide-react";

type ArchivedFile = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  frozenAt: string;
};

type Tray = {
  id: string;
  name: string;
};

type FolderType = {
  id: string;
  name: string;
  parentFolderId: string | null;
};

export function ViewArchivesPage() {
  const [files, setFiles] = useState<ArchivedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [folders, setFolders] = useState<FolderType[]>([]);

  const { tenantId } = useParams();
  const [searchParams] = useSearchParams();
  const trayParam = searchParams.get("trayId");

  const [trays, setTrays] = useState<Tray[]>([]);
  const [selectedTrayId, setSelectedTrayId] = useState<string | null>(null);

  useEffect(() => {
    if (trayParam) {
      setSelectedTrayId(trayParam);
    }
  }, [trayParam]);

  function convertToMB(bytes: number) {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  // Reset folder navigation when changing trays
  useEffect(() => {
    setCurrentFolderId(null);
    setBreadcrumb([]);
  }, [selectedTrayId]);

  // Fetch archived files
  useEffect(() => {
    async function fetchFiles() {
      if (!selectedTrayId) return;

      setLoading(true);

      const token = localStorage.getItem("token");

      const url = currentFolderId
        ? `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/documents?folderId=${currentFolderId}`
        : `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/documents`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setFiles(data);
      setLoading(false);
    }

    fetchFiles();
  }, [selectedTrayId, currentFolderId, tenantId]);

  // Fetch trays
  useEffect(() => {
    async function fetchTrays() {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      setTrays(data);

      if (data.length > 0) {
        if (trayParam && data.some((t: Tray) => t.id === trayParam)) {
          setSelectedTrayId(trayParam);
        } else {
          setSelectedTrayId(data[0].id);
        }
      }
    }

    if (tenantId) {
      fetchTrays();
    }
  }, [tenantId]);

  // Fetch folders
  useEffect(() => {
    async function fetchFolders() {
      if (!selectedTrayId) return;

      const token = localStorage.getItem("token");

      const url = currentFolderId
        ? `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders?parentFolderId=${currentFolderId}`
        : `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setFolders(data);
    }

    fetchFolders();
  }, [selectedTrayId, currentFolderId, tenantId]);

  function openFolder(folder: FolderType) {
    setCurrentFolderId(folder.id);

    setBreadcrumb([
      ...breadcrumb,
      {
        id: folder.id,
        name: folder.name,
      },
    ]);
  }

  function goToBreadcrumb(index: number) {
    if (index === -1) {
      // Clicked the root/tray name
      setCurrentFolderId(null);
      setBreadcrumb([]);
      return;
    }

    const clicked = breadcrumb[index];

    setCurrentFolderId(clicked.id);
    setBreadcrumb(breadcrumb.slice(0, index + 1));
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim() || !selectedTrayId) return;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newFolderName,
          parentFolderId: currentFolderId,
        }),
      },
    );
    if (!response.ok) {
      alert("Failed to create folder");
      return;
    }
    const created = await response.json();
    setFolders([...folders, created]);
    setNewFolderName("");
    setShowCreateFolder(false);
  }

  async function handleMove(documentId: string, folderId: string | null) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/documents/${documentId}/move`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folderId }),
      },
    );
    if (!response.ok) {
      alert("Failed to move document");
      return;
    }
    // The document moved to a different folder - it no longer belongs
    // in THIS level's view, so remove it from the current list directly
    // // rather than re-fetching.
    setFiles(files.filter((f) => f.id !== documentId));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Archived Documents</h1>

      <div className="flex items-center justify-between mb-3">
        {showCreateFolder ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="border border-[var(--color-line)] rounded-md px-3 py-1.5 text-sm"
            />
            <button
              onClick={handleCreateFolder}
              className="text-sm text-[var(--color-vault)] hover:underline"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateFolder(false)}
              className="text-sm text-[var(--color-muted)] hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateFolder(true)}
            className="text-sm text-[var(--color-vault)] hover:underline flex items-center gap-1.5"
          >
            <FolderPlus className="w-4 h-4" /> New folder
          </button>
        )}

        <Link
          to={`/tenant/${tenantId}/upload?trayId=${selectedTrayId || ""}${currentFolderId ? `&folderId=${currentFolderId}` : ""}`}
          className="text-sm bg-[var(--color-vault)] text-white px-3 py-1.5 rounded-md hover:opacity-90 flex items-center gap-1.5"
        >
          <Upload className="w-4 h-4" /> Upload file
        </Link>
      </div>

      {/* Tray tabs */}
      <div className="flex gap-2 mb-4 border-b border-[var(--color-line)]">
        {trays.map((tray) => (
          <button
            key={tray.id}
            onClick={() => setSelectedTrayId(tray.id)}
            className={
              selectedTrayId === tray.id
                ? "px-3 py-2 text-sm font-medium text-[var(--color-vault)] border-b-2 border-[var(--color-vault)]"
                : "px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }
          >
            {tray.name}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-[var(--color-muted)] mb-3">
        <button
          onClick={() => goToBreadcrumb(-1)}
          className="hover:text-[var(--color-ink)] hover:underline"
        >
          {trays.find((t) => t.id === selectedTrayId)?.name ?? "Root"}
        </button>

        {breadcrumb.map((crumb, index) => (
          <span key={crumb.id}>
            {" / "}

            <button
              onClick={() => goToBreadcrumb(index)}
              className="hover:text-[var(--color-ink)] hover:underline"
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      <div className="border border-[var(--color-line)] rounded-md bg-white overflow-hidden shadow-sm mb-4">
        {/* Folders */}
        {folders.length > 0 && (
          <ul className="flex flex-col">
            {folders.map((folder) => (
              <li key={folder.id} className="border-b border-[var(--color-line)] last:border-b-0">
                <button
                  onClick={() => openFolder(folder)}
                  className="w-full text-left px-4 py-3 hover:bg-[#F2EFE8] flex items-center gap-3 transition-colors"
                >
                  <Folder className="w-5 h-5 text-gray-500 fill-current" />
                  <span className="font-medium text-sm text-gray-900">{folder.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Separator if both exist */}
        {folders.length > 0 && files.length > 0 && (
          <div className="border-b border-[var(--color-line)] w-full"></div>
        )}

        {/* Files */}
        {loading && <div className="px-4 py-3 text-sm text-[var(--color-muted)]">Loading...</div>}

        {!loading && files.length === 0 && folders.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
            This folder is empty.
          </div>
        )}

        {!loading && files.length > 0 && (
          <ul className="flex flex-col">
            {files.map((file) => (
              <li
                key={file.id}
                className="px-4 py-3 border-b border-[var(--color-line)] last:border-b-0 flex justify-between items-center hover:bg-[#F2EFE8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{file.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                      <span>{convertToMB(file.sizeBytes)}</span>
                      <span>&bull;</span>
                      <span>{new Date(file.frozenAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <select
                  onChange={(e) => handleMove(file.id, e.target.value || null)}
                  defaultValue=""
                  className="text-sm border border-[var(--color-line)] rounded px-2 py-1 bg-white hover:bg-gray-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="" disabled>Move to...</option>
                  <option value="">Root (no folder)</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dashboard */}
      <Link
        to="/tenants"
        className="inline-block mt-4 text-[var(--color-vault)] hover:underline"
      >
        Dashboard
      </Link>
    </div>
  );
}
