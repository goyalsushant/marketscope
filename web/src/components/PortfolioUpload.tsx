import { type ChangeEvent, useState } from "react";
import { uploadPortfolioFile } from "../api/portfolioApi";

interface PortfolioUploadProps {
  onUploaded: (
    uploadId: string
  ) => void;
}

export function PortfolioUpload({
  onUploaded
}: PortfolioUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<{
    fileName: string;
    rowCount: number;
  } | null>(null);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isCsv = selectedFile.name
      .toLowerCase()
      .endsWith(".csv");

    if (!isCsv) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a portfolio CSV file.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const result = await uploadPortfolioFile(file);

      setSuccess({
        fileName: result.fileName,
        rowCount: result.rowCount
      });

      onUploaded(
        result.id
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload portfolio."
      );

    } finally {
      setUploading(false);
      setFile(null);
    }
  }

  return (
    <section>
      <h2>Portfolio Upload</h2>

      <p>
        Upload your portfolio CSV
        containing your existing stores.
      </p>

      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {file && (
        <p>
          Selected:{" "}
          <strong>
            {file.name}
          </strong>
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={
          !file || uploading
        }
      >
        {uploading
          ? "Uploading..."
          : "Upload Portfolio"}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            color: "crimson"
          }}
        >
          {error}
        </p>
      )}

      {success && (
        <p
          aria-live="polite"
          style={{
            color: "green"
          }}
        >
          Portfolio uploaded successfully.
          {" "}
          {success.rowCount} stores loaded.
        </p>
      )}
    </section>
  );
}
