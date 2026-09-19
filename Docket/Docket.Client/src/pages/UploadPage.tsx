import { useState } from "react";
import { useParams } from "react-router";

export function UploadPage() {
  const { tenantId } = useParams(); // it captures the parameters from the url, in this case the tenant-id and gives back as an object
  const [file, setFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tenant/${tenantId}/documents/upload`,
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
    alert("Uploaded!");
    setFile(null);
  }

  return (
    <div>
      Upload File(s) :{" "}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
}
