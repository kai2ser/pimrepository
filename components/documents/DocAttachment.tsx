"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/drizzle/schema";
import {
  FileText,
  FileType,
  FileCode,
  ExternalLink,
  Loader2,
  Paperclip,
  Trash2,
  RefreshCw,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPT = ".pdf,.doc,.docx,.txt";

function fileIcon(fileName?: string | null) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="h-3.5 w-3.5 text-red-500" />;
  if (ext === "doc" || ext === "docx")
    return <FileType className="h-3.5 w-3.5 text-blue-500" />;
  if (ext === "txt") return <FileCode className="h-3.5 w-3.5 text-gray-500" />;
  return <Paperclip className="h-3.5 w-3.5 text-gray-400" />;
}

function fileTypeBadge(fileName?: string | null) {
  const ext = fileName?.split(".").pop()?.toUpperCase();
  if (!ext) return null;
  const colors: Record<string, string> = {
    PDF: "bg-red-50 text-red-700 border-red-200",
    DOC: "bg-blue-50 text-blue-700 border-blue-200",
    DOCX: "bg-blue-50 text-blue-700 border-blue-200",
    TXT: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${colors[ext] ?? "bg-gray-50"}`}
    >
      {ext}
    </Badge>
  );
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DocAttachmentProps {
  /** "ENG" or "ORI" */
  langType: "ENG" | "ORI";
  langCode?: string;
  langLabel?: string;
  recordId: string;
  document?: Document | null;
  onUpdate: (doc: Document | null) => void;
}

export function DocAttachment({
  langType,
  langCode,
  langLabel,
  recordId,
  document,
  onUpdate,
}: DocAttachmentProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("recordId", recordId);
      form.append("langType", langType);
      if (langCode) form.append("langCode", langCode);
      if (langLabel) form.append("langLabel", langLabel);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      const doc: Document = await res.json();
      toast.success("File attached successfully");
      onUpdate(doc);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Attachment removed");
      onUpdate(null);
    } catch {
      toast.error("Failed to remove attachment");
    } finally {
      setDeleting(false);
    }
  };

  // ── Uploaded state ─────────────────────────────────────────────────────────
  if (document) {
    return (
      <div className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-md border bg-muted/30 group">
        {fileIcon(document.fileName)}
        <span className="text-xs text-foreground font-medium flex-1 truncate min-w-0">
          {document.fileName}
        </span>
        {fileTypeBadge(document.fileName)}
        {formatBytes(document.fileSize) && (
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            {formatBytes(document.fileSize)}
          </span>
        )}

        {/* Open */}
        <a href={document.blobUrl} target="_blank" rel="noopener noreferrer">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            title="Open file"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>

        {/* Replace */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          title="Replace file"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>

        {/* Delete */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
          title="Remove attachment"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  return (
    <div
      className="flex items-center gap-2 mt-1.5 px-3 py-2 rounded-md border border-dashed cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors"
      onClick={() => !uploading && fileRef.current?.click()}
    >
      {uploading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : (
        <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className="text-xs text-muted-foreground">
        {uploading ? "Uploading…" : "Attach file (PDF, Word, or Text)"}
      </span>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
        }}
      />
    </div>
  );
}
