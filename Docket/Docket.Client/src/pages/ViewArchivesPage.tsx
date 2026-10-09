import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  FileArchive,
  FileBadge,
  FolderPlus,
  MoreHorizontal,
  MoveRight,
  ChevronRight,
  Inbox,
  List,
  LayoutGrid,
  Image,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

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

type ViewMode = "list" | "tiles" | "thumbnails";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function fileIconInfo(mimeType: string): {
  Icon: React.ElementType;
  colorClass: string;
  bgClass: string;
} {
  if (mimeType.startsWith("image/"))
    return { Icon: FileImage, colorClass: "text-purple-500", bgClass: "bg-purple-50 dark:bg-purple-950" };
  if (mimeType.startsWith("video/"))
    return { Icon: FileVideo, colorClass: "text-pink-500", bgClass: "bg-pink-50 dark:bg-pink-950" };
  if (mimeType.startsWith("audio/"))
    return { Icon: FileAudio, colorClass: "text-yellow-500", bgClass: "bg-yellow-50 dark:bg-yellow-950" };
  if (mimeType === "application/pdf")
    return { Icon: FileBadge, colorClass: "text-red-500", bgClass: "bg-red-50 dark:bg-red-950" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return { Icon: FileSpreadsheet, colorClass: "text-green-600", bgClass: "bg-green-50 dark:bg-green-950" };
  if (mimeType.includes("word") || mimeType.includes("document") || mimeType === "text/plain")
    return { Icon: FileText, colorClass: "text-blue-500", bgClass: "bg-blue-50 dark:bg-blue-950" };
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("gzip") || mimeType.includes("rar"))
    return { Icon: FileArchive, colorClass: "text-orange-500", bgClass: "bg-orange-50 dark:bg-orange-950" };
  if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("html") || mimeType.includes("xml") || mimeType.includes("css"))
    return { Icon: FileCode, colorClass: "text-teal-500", bgClass: "bg-teal-50 dark:bg-teal-950" };
  return { Icon: File, colorClass: "text-[var(--color-muted)]", bgClass: "bg-[var(--color-line)]" };
}

// ── View Mode Toggle ──────────────────────────────────────────────────────────

const VIEW_MODES: { mode: ViewMode; Icon: React.ElementType; label: string }[] = [
  { mode: "list",       Icon: List,       label: "List" },
  { mode: "tiles",      Icon: LayoutGrid, label: "Tiles" },
  { mode: "thumbnails", Icon: Image,      label: "Thumbnails" },
];

function ViewToggle({ current, onChange }: { current: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-[var(--color-line)] bg-[var(--color-paper)] p-0.5"
      role="group"
      aria-label="View mode"
    >
      {VIEW_MODES.map(({ mode, Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          title={label}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
            current === mode
              ? "bg-[var(--color-surface)] text-[var(--color-vault)] shadow-sm"
              : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

// ── Overflow Menu ─────────────────────────────────────────────────────────────

interface OverflowMenuProps {
  file: ArchivedFile;
  folders: FolderType[];
  onMove: (documentId: string, folderId: string | null) => void;
}

function OverflowMenu({ file, folders, onMove }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const [showMovePanel, setShowMovePanel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowMovePanel(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function handleMove(folderId: string | null) {
    onMove(file.id, folderId);
    setOpen(false);
    setShowMovePanel(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); setShowMovePanel(false); }}
        className="w-7 h-7 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-line)] transition-colors flex-shrink-0"
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg shadow-lg overflow-hidden text-sm">
          {!showMovePanel ? (
            <>
              <button
                onClick={() => setShowMovePanel(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors"
              >
                <MoveRight className="w-4 h-4 text-[var(--color-muted)]" /> Move to…
              </button>
              <div className="border-t border-[var(--color-line)]" />
              <button disabled className="w-full flex items-center gap-2 px-3 py-2 text-left text-[var(--color-muted)] cursor-not-allowed opacity-50">
                Rename <span className="ml-auto text-xs">Soon</span>
              </button>
              <button disabled className="w-full flex items-center gap-2 px-3 py-2 text-left text-[var(--color-danger)] cursor-not-allowed opacity-50">
                Delete <span className="ml-auto text-xs">Soon</span>
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 text-xs font-medium text-[var(--color-muted)] border-b border-[var(--color-line)] flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> Move to
              </div>
              <button
                onClick={() => handleMove(null)}
                className="w-full text-left px-3 py-2 text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors flex items-center gap-2"
              >
                <Inbox className="w-4 h-4 text-[var(--color-muted)]" /> Root (no folder)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMove(folder.id)}
                  className="w-full text-left px-3 py-2 text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors flex items-center gap-2"
                >
                  <Folder className="w-4 h-4 text-[var(--color-muted)]" /> {folder.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tile Card ─────────────────────────────────────────────────────────────────

function TileCard({ file, folders, onMove }: { file: ArchivedFile; folders: FolderType[]; onMove: (id: string, fId: string | null) => void }) {
  const { Icon, colorClass, bgClass } = fileIconInfo(file.mimeType);
  return (
    <div className="flex flex-col rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-vault)] transition-colors overflow-hidden">
      <div className={`flex items-center justify-center h-20 ${bgClass} border-b border-[var(--color-line)]`}>
        <Icon className={`w-10 h-10 ${colorClass}`} strokeWidth={1.25} />
      </div>
      <div className="px-3 py-2 flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-ink)] truncate" title={file.fileName}>{file.fileName}</p>
        <p className="text-xs text-[var(--color-muted)]">{formatSize(file.sizeBytes)}</p>
      </div>
      <div className="px-3 pb-2 flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)]">{new Date(file.frozenAt).toLocaleDateString()}</span>
        <OverflowMenu file={file} folders={folders} onMove={onMove} />
      </div>
    </div>
  );
}

// ── Folder Card ───────────────────────────────────────────────────────────────

function FolderCard({ folder, onClick, large }: { folder: FolderType; onClick: () => void; large?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-vault)] transition-colors p-4 text-center ${large ? "h-40" : "h-28"}`}
    >
      <Folder className={`text-[var(--color-vault)] ${large ? "w-14 h-14" : "w-9 h-9"}`} strokeWidth={1.25} />
      <span className="text-sm font-medium text-[var(--color-ink)] truncate w-full" title={folder.name}>{folder.name}</span>
    </button>
  );
}

// ── Thumbnail Card ────────────────────────────────────────────────────────────

function ThumbnailCard({ file, folders, onMove }: { file: ArchivedFile; folders: FolderType[]; onMove: (id: string, fId: string | null) => void }) {
  const { Icon, colorClass, bgClass } = fileIconInfo(file.mimeType);
  return (
    <div className="flex flex-col rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-vault)] transition-colors overflow-hidden">
      <div className={`flex items-center justify-center h-36 ${bgClass} border-b border-[var(--color-line)] relative`}>
        <Icon className={`w-16 h-16 ${colorClass}`} strokeWidth={1} />
        <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10 text-[var(--color-muted)] uppercase tracking-wider">
          {file.mimeType.split("/")[1]?.slice(0, 6) ?? "file"}
        </span>
      </div>
      <div className="px-3 py-2 flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-ink)] truncate" title={file.fileName}>{file.fileName}</p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">{formatSize(file.sizeBytes)} · {new Date(file.frozenAt).toLocaleDateString()}</p>
        </div>
        <OverflowMenu file={file} folders={folders} onMove={onMove} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ViewArchivesPage() {
  const { tenantId } = useParams();

  const [trays, setTrays] = useState<Tray[]>([]);
  const [selectedTrayId, setSelectedTrayId] = useState<string | null>(null);
  const [files, setFiles] = useState<ArchivedFile[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem("vault-view-mode");
    if (stored === "list" || stored === "tiles" || stored === "thumbnails") return stored;
    return "list";
  });

  function changeViewMode(m: ViewMode) {
    setViewMode(m);
    localStorage.setItem("vault-view-mode", m);
  }

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!tenantId) return;
    async function fetchTrays() {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTrays(data);
      if (data.length > 0) setSelectedTrayId(data[0].id);
    }
    fetchTrays();
  }, [tenantId]);

  useEffect(() => {
    setCurrentFolderId(null);
    setBreadcrumb([]);
  }, [selectedTrayId]);

  useEffect(() => {
    if (!selectedTrayId) return;
    async function fetchFolders() {
      const token = localStorage.getItem("token");
      const url = currentFolderId
        ? `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders?parentFolderId=${currentFolderId}`
        : `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setFolders(await res.json());
    }
    fetchFolders();
  }, [selectedTrayId, currentFolderId, tenantId]);

  useEffect(() => {
    if (!selectedTrayId) return;
    setLoading(true);
    async function fetchFiles() {
      const token = localStorage.getItem("token");
      const url = currentFolderId
        ? `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/documents?folderId=${currentFolderId}`
        : `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/documents`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setFiles(await res.json());
      setLoading(false);
    }
    fetchFiles();
  }, [selectedTrayId, currentFolderId, tenantId]);

  // ── Navigation ────────────────────────────────────────────────────────────

  function openFolder(folder: FolderType) {
    setCurrentFolderId(folder.id);
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
  }

  function goToBreadcrumb(index: number) {
    if (index === -1) { setCurrentFolderId(null); setBreadcrumb([]); }
    else { setCurrentFolderId(breadcrumb[index].id); setBreadcrumb(breadcrumb.slice(0, index + 1)); }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function handleCreateFolder() {
    if (!newFolderName.trim() || !selectedTrayId) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/trays/${selectedTrayId}/folders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newFolderName, parentFolderId: currentFolderId }),
      },
    );
    if (!res.ok) { alert("Failed to create folder"); return; }
    setFolders([...folders, await res.json()]);
    setNewFolderName("");
    setShowCreateFolder(false);
  }

  async function handleMove(documentId: string, folderId: string | null) {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/documents/${documentId}/move`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folderId }),
      },
    );
    if (!res.ok) { alert("Failed to move document"); return; }
    setFiles(files.filter((f) => f.id !== documentId));
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeTray = trays.find((t) => t.id === selectedTrayId);
  const isEmpty = !loading && files.length === 0 && folders.length === 0;
  const isGrid = viewMode === "tiles" || viewMode === "thumbnails";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col gap-6">

      {/* Page heading row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Vault</h1>
        <Link
          to="/tenants"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Main card — mirrors the settings card pattern */}
      <div className="flex-1 flex flex-col md:flex-row bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg shadow-sm overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-[var(--color-line)] flex flex-col">
          <div className="px-4 py-4 border-b border-[var(--color-line)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
              Trays
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
            {trays.length === 0 && (
              <p className="px-3 py-2 text-xs text-[var(--color-muted)]">No trays found.</p>
            )}
            {trays.map((tray) => {
              const active = tray.id === selectedTrayId;
              return (
                <button
                  key={tray.id}
                  onClick={() => setSelectedTrayId(tray.id)}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-vault)] text-white"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Inbox className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tray.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Explorer ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-[var(--color-line)] flex items-center gap-3 flex-wrap">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-[var(--color-muted)] flex-1 min-w-0 overflow-x-auto">
              <button
                onClick={() => goToBreadcrumb(-1)}
                className="hover:text-[var(--color-ink)] whitespace-nowrap transition-colors font-medium text-[var(--color-vault)]"
              >
                {activeTray?.name ?? "Vault"}
              </button>
              {breadcrumb.map((crumb, index) => (
                <span key={crumb.id} className="flex items-center gap-1 min-w-0">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                  <button
                    onClick={() => goToBreadcrumb(index)}
                    className={`hover:text-[var(--color-ink)] whitespace-nowrap transition-colors truncate ${
                      index === breadcrumb.length - 1 ? "text-[var(--color-ink)] font-medium" : ""
                    }`}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* New folder */}
              {!showCreateFolder ? (
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-vault)] transition-colors"
                  title="New folder"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New folder</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    autoFocus
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                      if (e.key === "Escape") setShowCreateFolder(false);
                    }}
                    placeholder="Folder name"
                    className="border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-[var(--color-vault)] placeholder:text-[var(--color-muted)]"
                  />
                  <button onClick={handleCreateFolder} className="text-sm text-[var(--color-vault)] hover:underline">Create</button>
                  <button onClick={() => { setShowCreateFolder(false); setNewFolderName(""); }} className="text-sm text-[var(--color-muted)] hover:underline">Cancel</button>
                </div>
              )}

              <div className="w-px h-5 bg-[var(--color-line)]" />
              <ViewToggle current={viewMode} onChange={changeViewMode} />
            </div>
          </div>

          {/* Column headers – list only */}
          {viewMode === "list" && (
            <div className="px-4 py-2 border-b border-[var(--color-line)] bg-[var(--color-paper)] hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4">
              <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</span>
              <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-20 text-right">Size</span>
              <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-36 text-right">Archived</span>
              <span className="w-7" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16 text-sm text-[var(--color-muted)]">
                Loading…
              </div>
            )}

            {/* Empty */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-[var(--color-line)] flex items-center justify-center">
                  <Folder className="w-6 h-6 text-[var(--color-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--color-ink)]">This folder is empty</p>
                <p className="text-xs text-[var(--color-muted)]">Upload documents or create a folder to get started.</p>
              </div>
            )}

            {/* ── LIST ── */}
            {!loading && !isGrid && (
              <>
                {folders.map((folder) => (
                  <div key={folder.id} className="border-b border-[var(--color-line)] last:border-b-0">
                    <button
                      onClick={() => openFolder(folder)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--color-paper)] flex items-center gap-3 transition-colors sm:grid sm:grid-cols-[1fr_auto_auto_auto]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder className="w-5 h-5 text-[var(--color-vault)] flex-shrink-0" />
                        <span className="font-medium text-sm text-[var(--color-ink)] truncate">{folder.name}</span>
                      </div>
                      <span className="hidden sm:block w-20" />
                      <span className="hidden sm:block w-36" />
                      <span className="hidden sm:block w-7" />
                    </button>
                  </div>
                ))}
                {files.map((file) => {
                  const { Icon, colorClass } = fileIconInfo(file.mimeType);
                  return (
                    <div
                      key={file.id}
                      className="border-b border-[var(--color-line)] last:border-b-0 px-4 py-3 hover:bg-[var(--color-paper)] flex items-center gap-3 transition-colors sm:grid sm:grid-cols-[1fr_auto_auto_auto]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${colorClass}`} strokeWidth={1.5} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{file.fileName}</p>
                          <p className="sm:hidden text-xs text-[var(--color-muted)] mt-0.5">
                            {formatSize(file.sizeBytes)} · {new Date(file.frozenAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="hidden sm:block text-xs text-[var(--color-muted)] text-right w-20">{formatSize(file.sizeBytes)}</span>
                      <span className="hidden sm:block text-xs text-[var(--color-muted)] text-right w-36">{new Date(file.frozenAt).toLocaleString()}</span>
                      <div className="ml-auto sm:ml-0 flex-shrink-0 w-7">
                        <OverflowMenu file={file} folders={folders} onMove={handleMove} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ── TILES ── */}
            {!loading && viewMode === "tiles" && (folders.length > 0 || files.length > 0) && (
              <div className="p-4">
                {folders.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-3">Folders</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                      {folders.map((folder) => (
                        <FolderCard key={folder.id} folder={folder} onClick={() => openFolder(folder)} />
                      ))}
                    </div>
                  </>
                )}
                {files.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-3">Files</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {files.map((file) => (
                        <TileCard key={file.id} file={file} folders={folders} onMove={handleMove} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── THUMBNAILS ── */}
            {!loading && viewMode === "thumbnails" && (folders.length > 0 || files.length > 0) && (
              <div className="p-4">
                {folders.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-3">Folders</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                      {folders.map((folder) => (
                        <FolderCard key={folder.id} folder={folder} onClick={() => openFolder(folder)} large />
                      ))}
                    </div>
                  </>
                )}
                {files.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-3">Files</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {files.map((file) => (
                        <ThumbnailCard key={file.id} file={file} folders={folders} onMove={handleMove} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
