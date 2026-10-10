import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  Inbox,
  Check,
  X,
  FileText,
  AlertCircle,
  RefreshCw,
  Folder,
  Layers,
  Upload,
} from "lucide-react";

type IntakeItem = {
  id: string;
  tenantId: string;
  trayId: string;
  trayName?: string | null;
  folderId?: string | null;
  folderName?: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByUserId: string;
  status: number | string;
  rejectionReason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

export function ReviewPage() {
  const { tenantId } = useParams();
  const [items, setItems] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Pending");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectingItem, setRejectingItem] = useState<IntakeItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isBulkReject, setIsBulkReject] = useState(false);

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  async function fetchIntakeItems() {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/intake?status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError("Failed to fetch intake items.");
      }
    } catch {
      setError("Network error fetching intake items.");
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchIntakeItems();
    }
  }, [tenantId, statusFilter]);

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedIds(items.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  // Single Approve
  async function handleApprove(item: IntakeItem) {
    setActionLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/intake/${item.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );
      if (response.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedIds((prev) => prev.filter((i) => i !== item.id));
      } else {
        const err = await response.text();
        setError(err || "Failed to approve document.");
      }
    } catch {
      setError("Network error approving document.");
    } finally {
      setActionLoading(false);
    }
  }

  // Single Reject confirm
  function openRejectModal(item: IntakeItem) {
    setRejectingItem(item);
    setIsBulkReject(false);
    setRejectionReason("");
  }

  // Bulk Reject confirm
  function openBulkRejectModal() {
    setIsBulkReject(true);
    setRejectionReason("");
  }

  async function submitReject() {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setActionLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      if (isBulkReject) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/intake/bulk-reject`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              itemIds: selectedIds,
              reason: rejectionReason,
            }),
          },
        );

        if (response.ok) {
          setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
          setSelectedIds([]);
          setRejectingItem(null);
        } else {
          const err = await response.text();
          setError(err || "Failed to bulk reject items.");
        }
      } else if (rejectingItem) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/intake/${rejectingItem.id}/reject`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason: rejectionReason }),
          },
        );

        if (response.ok) {
          setItems((prev) => prev.filter((i) => i.id !== rejectingItem.id));
          setSelectedIds((prev) => prev.filter((i) => i !== rejectingItem.id));
          setRejectingItem(null);
        } else {
          const err = await response.text();
          setError(err || "Failed to reject item.");
        }
      }
    } catch {
      setError("Network error rejecting document(s).");
    } finally {
      setActionLoading(false);
      setIsBulkReject(false);
      setRejectingItem(null);
    }
  }

  // Bulk Approve
  async function handleBulkApprove() {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/intake/bulk-approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemIds: selectedIds }),
        },
      );

      if (response.ok) {
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
      } else {
        const err = await response.text();
        setError(err || "Failed to bulk approve items.");
      }
    } catch {
      setError("Network error during bulk approval.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[var(--color-line)] rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--color-line)] gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)] flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[var(--color-vault)]" /> Document Review
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Approve files to freeze them into the permanent archive, or reject them with a reason.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIntakeItems}
            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[#F2EFE8] rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to={`/tenant/${tenantId}/upload`}
            className="text-xs bg-[var(--color-vault)] text-white px-3 py-1.5 rounded-md hover:opacity-90 flex items-center gap-1.5 font-medium transition-opacity"
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 my-4 border-b border-[var(--color-line)] pb-2 text-sm">
        {["Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-[var(--color-vault)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[#F2EFE8]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bulk action bar (visible when items selected) */}
      {statusFilter === "Pending" && selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-[#EAE6DF] border border-[var(--color-line)] rounded-md flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-ink)]">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={actionLoading}
              className="bg-[var(--color-vault)] text-white text-xs px-3 py-1.5 rounded hover:opacity-90 flex items-center gap-1 font-medium disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Approve Selected
            </button>
            <button
              onClick={openBulkRejectModal}
              disabled={actionLoading}
              className="bg-white border border-red-300 text-red-700 text-xs px-3 py-1.5 rounded hover:bg-red-50 flex items-center gap-1 font-medium disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Items list / table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--color-muted)]">
          Loading review items...
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            No {statusFilter.toLowerCase()} items found
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {statusFilter === "Pending"
              ? "All documents have been reviewed and processed."
              : `There are currently no items marked as ${statusFilter.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)] font-semibold">
                {statusFilter === "Pending" && (
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        items.length > 0 && selectedIds.length === items.length
                      }
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Target Tray</th>
                <th className="py-2.5 px-3">Target Folder</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Uploaded</th>
                {statusFilter === "Pending" && (
                  <th className="py-2.5 px-3 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#F2EFE8] transition-colors ${
                      isSelected ? "bg-[#FAF8F4]" : ""
                    }`}
                  >
                    {statusFilter === "Pending" && (
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-[var(--color-ink)]">
                          {item.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        {item.trayName || "Tray"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5 text-gray-400" />
                        {item.folderName || "Root (No folder)"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">
                      {formatSize(item.sizeBytes)}
                    </td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    {statusFilter === "Pending" && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={actionLoading}
                            className="bg-[var(--color-vault)] text-white hover:opacity-90 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-opacity disabled:opacity-50"
                            title="Approve and freeze into archive"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(item)}
                            disabled={actionLoading}
                            className="border border-red-300 text-red-600 hover:bg-red-50 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                            title="Reject item"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {(rejectingItem || isBulkReject) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-lg border border-[var(--color-line)]">
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">
              {isBulkReject
                ? `Reject ${selectedIds.length} Document(s)`
                : `Reject "${rejectingItem?.fileName}"`}
            </h3>
            <p className="text-xs text-[var(--color-muted)] mb-3">
              Please enter a reason for rejecting this document.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Illegible scan, wrong department, duplicate file..."
              className="w-full border border-[var(--color-line)] rounded p-2 text-xs mb-3 h-20 focus:outline-none focus:ring-1 focus:ring-[var(--color-vault)]"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingItem(null);
                  setIsBulkReject(false);
                }}
                className="px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

