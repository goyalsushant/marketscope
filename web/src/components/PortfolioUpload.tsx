import {
  useState,
  type ChangeEvent
} from "react";

import "./PortfolioUpload.css";
import { uploadPortfolioFile } from "../api/portfolioApi";

interface PortfolioUploadProps {
  onUploaded: (uploadId: string) => void;
}

export function PortfolioUpload({
  onUploaded
}: PortfolioUploadProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<{
      fileName: string;
      rowCount: number;
    } | null>(null);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError(
        "Please select a portfolio CSV file."
      );
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const result =
        await uploadPortfolioFile(file);

      setSuccess({
        fileName: result.fileName,
        rowCount: result.rowCount
      });

      onUploaded(result.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload portfolio."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="portfolio-upload">
      <div className="portfolio-upload-header">
        <div>
          <h2>Portfolio</h2>

          <p>
            Upload your existing store portfolio
            as a CSV file.
          </p>
        </div>
      </div>

      <div className="portfolio-upload-body">
        <label className="file-dropzone">
          <span className="file-dropzone-title">
            {file
              ? file.name
              : "Choose a CSV file"}
          </span>

          <span className="file-dropzone-help">
            CSV files only
          </span>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {file && (
          <button
            type="button"
            className="primary-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "Upload Portfolio"}
          </button>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            <strong>
              Portfolio uploaded
            </strong>

            <span>
              {success.rowCount} stores loaded
            </span>
          </div>
        )}
      </div>
    </section>
  );
}