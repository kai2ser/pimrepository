import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecordWithDocs } from "@/modules/records/queries";
import { resolveCountryName } from "@/lib/countries-data";
import { TierBadge } from "@/components/records/TierBadge";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  Info,
  MapPin,
  Pencil,
} from "lucide-react";
import { DeleteRecordButton } from "@/components/records/DeleteRecordButton";
import { DocumentSection } from "@/components/documents/DocumentSection";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = await getRecordWithDocs(id);
  if (!record) return { title: "Record Not Found" };

  return {
    title: `${record.nameEng} — PIM Repository`,
    description: record.overview
      ? record.overview.slice(0, 160)
      : `Policy record: ${record.nameEng}`,
  };
}

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getRecordWithDocs(id);

  if (!record) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Repository
        </Link>
        <div className="flex gap-2">
          <Link href={`/records/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
          <DeleteRecordButton id={id} />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <MapPin className="h-3 w-3" />
            {resolveCountryName(record.country)}
            <span className="text-[10px] font-mono opacity-60 ml-0.5">({record.country})</span>
          </Badge>
          <TierBadge tier={record.policyGuidanceTier} type="policy" />
          <TierBadge tier={record.strategyTier} type="strategy" />
        </div>
        <h1 className="text-xl font-bold leading-snug">{record.nameEng}</h1>
        {record.nameOrig && (
          <p className="text-base text-muted-foreground italic">{record.nameOrig}</p>
        )}
      </div>

      <Separator />

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <MetaItem
          label="Year"
          value={record.year ? String(record.year) : undefined}
        />
        <MetaItem
          label="Year Revised"
          value={record.yearRevised ? String(record.yearRevised) : undefined}
        />
        <MetaItem label="Source" value={record.source ?? undefined} />
        <MetaItem
          label="Pages"
          value={record.pages ? String(record.pages) : undefined}
        />
      </div>

      {/* Overview */}
      {record.overview && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Overview
          </h2>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {record.overview}
          </p>
        </div>
      )}

      {/* Comment */}
      {record.comment && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Internal Comment
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">{record.comment}</p>
        </div>
      )}

      {/* External link — only render http(s) URLs */}
      {record.link && /^https?:\/\//i.test(record.link) && (
        <a
          href={record.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-700 hover:underline w-fit"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View source document
        </a>
      )}

      <Separator />

      {/* Documents */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Document Files
        </h2>

        {/* Naming convention recommendation */}
        <div className="border border-blue-200 bg-blue-50 rounded-md p-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Recommendation
          </p>
          <p className="text-sm text-blue-900 leading-relaxed">
            When adding documents, please follow this final naming convention:
          </p>
          <p className="text-xs font-mono text-blue-800 bg-blue-100 rounded px-2.5 py-1.5 border border-blue-200">
            [Country] [Agency] [Year] [Name] [Language: Original Language (OL) or English (ENG)]
          </p>
          <div className="text-xs font-mono text-blue-800 space-y-1 leading-relaxed">
            <p>Serbia Cabinet 2023 O KAPITALNIM PROJEKTIMA Decree on Public Investment Management No 23 (OL)</p>
            <p>Serbia Cabinet 2023 Decree on Public Investment Management No 23 (ENG)</p>
          </div>
          <p className="text-sm text-blue-900 leading-relaxed">
            To allow for formal citation of policies, please provide formal designation of the policy (e.g., Cabinet Decision 9/2026).
          </p>
        </div>

        <DocumentSection recordId={id} initialDocuments={record.documents} />
      </div>

      {/* Footer meta */}
      <div className="text-xs text-muted-foreground flex gap-4 pt-2">
        <span>ID: {record.id}</span>
        {record.tokens && <span>Tokens: {record.tokens.toLocaleString()}</span>}
        <span>
          Added: {new Date(record.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value ?? "—"}</p>
    </div>
  );
}
