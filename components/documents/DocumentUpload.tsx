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

// All languages available in Google Translate, sorted alphabetically
const NATIVE_LANGUAGES = [
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Albanian" },
  { code: "am", label: "Amharic" },
  { code: "ar", label: "Arabic" },
  { code: "hy", label: "Armenian" },
  { code: "as", label: "Assamese" },
  { code: "ay", label: "Aymara" },
  { code: "az", label: "Azerbaijani" },
  { code: "bm", label: "Bambara" },
  { code: "eu", label: "Basque" },
  { code: "be", label: "Belarusian" },
  { code: "bn", label: "Bengali" },
  { code: "bho", label: "Bhojpuri" },
  { code: "bs", label: "Bosnian" },
  { code: "bg", label: "Bulgarian" },
  { code: "ca", label: "Catalan" },
  { code: "ceb", label: "Cebuano" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "zh-TW", label: "Chinese (Traditional)" },
  { code: "co", label: "Corsican" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "dv", label: "Dhivehi" },
  { code: "doi", label: "Dogri" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "eo", label: "Esperanto" },
  { code: "et", label: "Estonian" },
  { code: "ee", label: "Ewe" },
  { code: "fil", label: "Filipino (Tagalog)" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "fy", label: "Frisian" },
  { code: "gl", label: "Galician" },
  { code: "ka", label: "Georgian" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "gn", label: "Guarani" },
  { code: "gu", label: "Gujarati" },
  { code: "ht", label: "Haitian Creole" },
  { code: "ha", label: "Hausa" },
  { code: "haw", label: "Hawaiian" },
  { code: "iw", label: "Hebrew" },
  { code: "hi", label: "Hindi" },
  { code: "hmn", label: "Hmong" },
  { code: "hu", label: "Hungarian" },
  { code: "is", label: "Icelandic" },
  { code: "ig", label: "Igbo" },
  { code: "ilo", label: "Ilocano" },
  { code: "id", label: "Indonesian" },
  { code: "ga", label: "Irish" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "jv", label: "Javanese" },
  { code: "kn", label: "Kannada" },
  { code: "kk", label: "Kazakh" },
  { code: "km", label: "Khmer" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "gom", label: "Konkani" },
  { code: "ko", label: "Korean" },
  { code: "kri", label: "Krio" },
  { code: "ku", label: "Kurdish (Kurmanji)" },
  { code: "ckb", label: "Kurdish (Sorani)" },
  { code: "ky", label: "Kyrgyz" },
  { code: "lo", label: "Lao" },
  { code: "la", label: "Latin" },
  { code: "lv", label: "Latvian" },
  { code: "ln", label: "Lingala" },
  { code: "lt", label: "Lithuanian" },
  { code: "lg", label: "Luganda" },
  { code: "lb", label: "Luxembourgish" },
  { code: "mk", label: "Macedonian" },
  { code: "mai", label: "Maithili" },
  { code: "mg", label: "Malagasy" },
  { code: "ms", label: "Malay" },
  { code: "ml", label: "Malayalam" },
  { code: "mt", label: "Maltese" },
  { code: "mi", label: "Maori" },
  { code: "mr", label: "Marathi" },
  { code: "mni-Mtei", label: "Meitei (Manipuri)" },
  { code: "lus", label: "Mizo" },
  { code: "mn", label: "Mongolian" },
  { code: "my", label: "Myanmar (Burmese)" },
  { code: "ne", label: "Nepali" },
  { code: "no", label: "Norwegian" },
  { code: "ny", label: "Nyanja (Chichewa)" },
  { code: "or", label: "Odia (Oriya)" },
  { code: "om", label: "Oromo" },
  { code: "ps", label: "Pashto" },
  { code: "fa", label: "Persian" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "pa", label: "Punjabi" },
  { code: "qu", label: "Quechua" },
  { code: "ro", label: "Romanian" },
  { code: "ru", label: "Russian" },
  { code: "sm", label: "Samoan" },
  { code: "sa", label: "Sanskrit" },
  { code: "gd", label: "Scots Gaelic" },
  { code: "nso", label: "Sepedi" },
  { code: "sr", label: "Serbian" },
  { code: "st", label: "Sesotho" },
  { code: "sn", label: "Shona" },
  { code: "sd", label: "Sindhi" },
  { code: "si", label: "Sinhala (Sinhalese)" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "so", label: "Somali" },
  { code: "es", label: "Spanish" },
  { code: "su", label: "Sundanese" },
  { code: "sw", label: "Swahili" },
  { code: "sv", label: "Swedish" },
  { code: "tg", label: "Tajik" },
  { code: "ta", label: "Tamil" },
  { code: "tt", label: "Tatar" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
  { code: "ti", label: "Tigrinya" },
  { code: "ts", label: "Tsonga" },
  { code: "tr", label: "Turkish" },
  { code: "tk", label: "Turkmen" },
  { code: "ak", label: "Twi (Akan)" },
  { code: "uk", label: "Ukrainian" },
  { code: "ur", label: "Urdu" },
  { code: "ug", label: "Uyghur" },
  { code: "uz", label: "Uzbek" },
  { code: "vi", label: "Vietnamese" },
  { code: "cy", label: "Welsh" },
  { code: "xh", label: "Xhosa" },
  { code: "yi", label: "Yiddish" },
  { code: "yo", label: "Yoruba" },
  { code: "zu", label: "Zulu" },
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
      const msg = err instanceof Error ? err.message : "Upload failed";
      console.error("[DocumentUpload]", err);
      toast.error(msg);
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
