"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PdfUploaderProps {
  courseId: string;
  currentPdfUrl: string | null;
  locale: string;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export function PdfUploader({ courseId, currentPdfUrl, locale }: PdfUploaderProps) {
  const t = useTranslations("professor.courseEditor");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(currentPdfUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Suppress unused locale warning — kept for future revalidation needs
  void locale;

  async function uploadFile(file: File) {
    setError(null);

    if (file.type !== "application/pdf") {
      setError(t("pdfInvalidType"));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t("pdfTooLarge"));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);

      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "tooLarge") {
          setError(t("pdfTooLarge"));
        } else if (data.error === "invalidType") {
          setError(t("pdfInvalidType"));
        } else {
          setError(t("pdfUploadError"));
        }
        return;
      }

      const data = await res.json();
      setPdfUrl(data.pdfUrl);
    } catch {
      setError(t("pdfUploadError"));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      const res = await fetch("/api/upload-pdf", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        setPdfUrl(null);
      } else {
        setError(t("pdfUploadError"));
      }
    } catch {
      setError(t("pdfUploadError"));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="rounded-xl border border-gray-200 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{t("pdfSection")}</h3>

      {pdfUrl ? (
        <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={18} className="text-gray-500 shrink-0" />
            <span className="text-sm text-gray-700 truncate">{pdfUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/api/pdf/${pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
            >
              {t("pdfPreview")}
              <ExternalLink size={14} />
            </a>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 size={14} className="me-1" />
              {t("pdfRemove")}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragOver
              ? "border-[var(--color-primary-600)] bg-purple-50"
              : "border-gray-300 hover:border-gray-400"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <p className="text-sm text-gray-500">{t("pdfUploading")}</p>
          ) : (
            <>
              <Upload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">{t("pdfDragDrop")}</p>
              <p className="text-xs text-gray-400 mt-1">{t("pdfMaxSize")}</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
