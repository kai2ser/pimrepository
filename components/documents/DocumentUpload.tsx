"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/drizzle/schema";
import {
  FileText,
  Loader2,
  Trash2,
  Upload,
  ExternalLink,
} from "lucide-react";

// Common language options for the native document selector
const NATIVE_LANGUAGES = [
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "id", label: "Indonesian" },
  { code: "lt", label: "Lithuanian" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "sw", label: "Swahili" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "other", label: "Other" },
];

interface DocumentUploadProps {
  recordId: string;
  documents: Document[];
  onUpdate: () => void;
}

export function DocumentUpload({ recordId, documents, onUpdate }: DocumentUploadProps) {
  const engDoc = documents.find((d) => d.langType === "ENG");
  const oriDoc = documents.find((d) => d.langType === "ORI");

  return (
    <div className="space-y-4">
      <DocSlot
        label="Native Language Document"
        langType="ORI"
        existing={oriDoc}
        recordId={recordId}
        onUpdate={onUpdate}
        showLangSelector
      />
      <DocSlot
        label="English Document"
        langType="ENG"
        langCode="en"
        langLabel="English"
        existing={engDoc}
        recordId={recordId}
        onUpdate={onUpdate}
      />
    </div>
  );
}

interface DocSlotProps {
  label: string;
  langType: "ENG" | "ORI";
  langCode?: string;
  langLabel?: string;
  existing?: Document;
  recordId: string;
  onUpdate: () => void;
  showLangSelector?: boolean;
}

function DocSlot({
  label,
  langType,
  langCode: defaultLangCode,
  langLabel: defaultLangLabel,
  existing,
  recordId,
  onUpdate,
  showLangSelector,
}: DocSlotProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [langCode, setLangCode] = useState(existing?.langCode ?? defaultLangCode ?? "");
  const [langLabel, setLangLabel] = useState(existing?.langLabel ?? defaultLangLabel ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Upload file directly from browser to Vercel Blob storage.
      // This bypasses the Next.js 4.5 MB body-size limit entirely.
      const blob = await upload(
        `records/${recordId}/${langType}_${file.name}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/documents/upload",
          clientPayload: JSON.stringify({ recordId, langType, langCode, langLabel }),
        }
      );

      // Step 2: Save the blob URL and metadata to the database.
      const saveRes = await fetch("/api/documents/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: blob.url,
          recordId,
          langType,
          langCode: langCode || null,
          langLabel: langLabel || null,
          fileName: file.name,
          fileSize: file.size,
        }),
      });
      if (!saveRes.ok) throw new Error((await saveRes.json()).error ?? "Failed to save document");

      toast.success(`${label} uploaded successfully`);
      onUpdate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${existing.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Document removed");
      onUpdate();
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {existing && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Uploaded
          </Badge>
        )}
      </div>

      {showLangSelector && (
        <div className="flex gap-2">
          <Select
            value={langCode || "none"}
            onValueChange={(v) => {
              if (v === "none") { setLangCode(""); setLangLabel(""); return; }
              const found = NATIVE_LANGUAGES.find((l) => l.code === v);
              setLangCode(v);
              setLangLabel(found?.label ?? v);
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select language…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select language…</SelectItem>
              {NATIVE_LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {langCode === "other" && (
            <Input
              className="h-8 text-xs"
              placeholder="Language name"
              value={langLabel}
              onChange={(e) => setLangLabel(e.target.value)}
            />
          )}
        </div>
      )}

      {existing ? (
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-md">
          <FileText className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{existing.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {existing.fileSize
                ? `${(existing.fileSize / 1024).toFixed(0)} KB`
                : "Size unknown"}
              {existing.langLabel && ` · ${existing.langLabel}`}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <a href={existing.blobUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Open document">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete document"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center">
                Click to upload PDF
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>
      )}

      {/* Replace option for existing document */}
      {existing && (
        <p
          className="text-xs text-muted-foreground underline cursor-pointer w-fit"
          onClick={() => fileRef.current?.click()}
        >
          Replace with a new file
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </p>
      )}
    </div>
  );
}
