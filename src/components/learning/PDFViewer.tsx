"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Load pdf.js worker from CDN — avoids copying WASM to public/
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const t = useTranslations("learning");
  const tCommon = useTranslations("common");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(700);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setContainerWidth(node.clientWidth);
  }, []);

  function onDocumentLoad({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPage(1);
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {t("pdfTitle")}
        </span>
        {numPages && (
          <span className="text-xs text-gray-500">
            {page} / {numPages}
          </span>
        )}
      </div>

      {/* PDF canvas */}
      <div ref={containerRef} className="overflow-auto bg-gray-100 flex justify-center p-4">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoad}
          loading={
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              {t("loading")}
            </div>
          }
          error={
            <div className="h-64 flex items-center justify-center text-red-500 text-sm">
              {tCommon("error")}
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={Math.min(containerWidth - 32, 900)}
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>

      {/* Navigation */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-gray-50 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {numPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(numPages!, p + 1))}
            disabled={page >= numPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
