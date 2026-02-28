"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";

interface CountryOption {
  iso3: string;
  name: string;
}

interface DocEntry {
  id: string;
  langType: string;
  langLabel: string | null;
  fileName: string | null;
  fileSize: number | null;
}

interface RecordEntry {
  id: string;
  nameEng: string;
  year: number | null;
  docs: DocEntry[];
}

interface Props {
  countries: CountryOption[];
  selectedIso3: string | null;
  records: RecordEntry[];
}

function fmtSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DownloadClient({ countries, selectedIso3, records }: Props) {
  const router = useRouter();

  const selectedCountry = countries.find((c) => c.iso3 === selectedIso3);
  const totalDocs = records.reduce((sum, r) => sum + r.docs.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Download Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a country to view and download all associated policy documents
          from the repository.
        </p>
      </div>

      {/* Country selector */}
      <div className="max-w-sm space-y-1.5">
        <label className="text-sm font-medium">Country</label>
        <Select
          value={selectedIso3 ?? "none"}
          onValueChange={(v) => {
            if (v === "none") router.push("/download");
            else router.push(`/download?iso3=${v}`);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a country…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select a country…</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.iso3} value={c.iso3}>
                {c.name}
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {c.iso3}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Showing {countries.length} countries with at least one policy record.
        </p>
      </div>

      {/* Results */}
      {selectedIso3 && selectedCountry && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedCountry.name}
              <span className="ml-2 font-mono text-sm text-muted-foreground font-normal">
                {selectedIso3}
              </span>
            </h2>
            <span className="text-sm text-muted-foreground">
              {records.length} record{records.length !== 1 ? "s" : ""} ·{" "}
              {totalDocs} document{totalDocs !== 1 ? "s" : ""}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
              No uploaded documents found for this country.
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {records.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  {/* Record header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm leading-snug">{r.nameEng}</p>
                      {r.year && (
                        <p className="text-xs text-muted-foreground mt-0.5">{r.year}</p>
                      )}
                    </div>
                  </div>

                  {/* Document download rows */}
                  <div className="space-y-2 pl-1">
                    {r.docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-4 rounded-md bg-muted/40 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {doc.fileName ?? "Document"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1 py-0 mr-1.5"
                              >
                                {doc.langType === "ENG"
                                  ? "English"
                                  : doc.langLabel ?? "Native Language"}
                              </Badge>
                              {fmtSize(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                        <a href={`/api/download/${doc.id}`} download>
                          <Button size="sm" variant="outline" className="shrink-0 gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
