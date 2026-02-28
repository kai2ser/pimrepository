"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { policyRecordSchema, type PolicyRecordInput } from "@/modules/records/schema";
import type { Document, PolicyRecord } from "@/drizzle/schema";
import { Loader2, Save } from "lucide-react";
import { DocAttachment } from "@/components/documents/DocAttachment";
import { CountryCombobox } from "@/components/records/CountryCombobox";
import { TIERS, STRATEGY_TYPES } from "@/lib/tiers";

interface RecordFormProps {
  record?: PolicyRecord;
  documents?: Document[];
  mode: "create" | "edit";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function RecordForm({ record, documents = [], mode }: RecordFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Local document state so uploads reflect immediately without page reload
  const [engDoc, setEngDoc] = useState<Document | null>(
    documents.find((d) => d.langType === "ENG") ?? null
  );
  const [oriDoc, setOriDoc] = useState<Document | null>(
    documents.find((d) => d.langType === "ORI") ?? null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PolicyRecordInput>({
    resolver: zodResolver(policyRecordSchema) as Resolver<PolicyRecordInput>,
    defaultValues: {
      country: record?.country ?? "",
      nameEng: record?.nameEng ?? "",
      nameOrig: record?.nameOrig ?? "",
      year: record?.year ?? undefined,
      source: record?.source ?? "",
      yearRevised: record?.yearRevised ?? undefined,
      overview: record?.overview ?? "",
      policyGuidanceTier: record?.policyGuidanceTier ?? undefined,
      strategyTier: record?.strategyTier ?? undefined,
      comment: record?.comment ?? "",
      link: record?.link ?? "",
      pages: record?.pages ?? undefined,
    },
  });

  const onSubmit = async (data: PolicyRecordInput) => {
    setSaving(true);
    try {
      const url = mode === "create" ? "/api/records" : `/api/records/${record!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }

      const saved = await res.json();
      toast.success(mode === "create" ? "Record created!" : "Record updated!");
      router.push(`/records/${saved.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Document Identity ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Document Identity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="space-y-1.5">
            <Label>Country *</Label>
            <CountryCombobox
              value={watch("country") || null}
              onChange={(iso3) => setValue("country", iso3 ?? "")}
            />
            <FieldError message={errors.country?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source">Source / Issuing Body</Label>
            <Input id="source" {...register("source")} placeholder="e.g. Ministry of Finance" />
          </div>

          {/* Native language name + attachment */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="nameOrig">Document Name (Native Language)</Label>
            <Input
              id="nameOrig"
              {...register("nameOrig")}
              placeholder="Title in original language (if different)"
            />

            {/* File attachment slot — only active in edit mode */}
            {mode === "edit" && record ? (
              <DocAttachment
                langType="ORI"
                recordId={record.id}
                document={oriDoc}
                onUpdate={(doc) => setOriDoc(doc)}
              />
            ) : (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                📎 File attachment available after saving the record
              </p>
            )}
          </div>

          {/* English name + attachment */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="nameEng">Document Name (English) *</Label>
            <Input
              id="nameEng"
              {...register("nameEng")}
              placeholder="Full title in English"
            />
            <FieldError message={errors.nameEng?.message} />

            {/* File attachment slot — only active in edit mode */}
            {mode === "edit" && record ? (
              <DocAttachment
                langType="ENG"
                langCode="en"
                langLabel="English"
                recordId={record.id}
                document={engDoc}
                onUpdate={(doc) => setEngDoc(doc)}
              />
            ) : (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                📎 File attachment available after saving the record
              </p>
            )}
          </div>

        </div>
      </section>

      <Separator />

      {/* ── Publication ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Publication
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" {...register("year")} placeholder="e.g. 2020" />
            <FieldError message={errors.year?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearRevised">Year Revised</Label>
            <Input id="yearRevised" type="number" {...register("yearRevised")} placeholder="e.g. 2023" />
            <FieldError message={errors.yearRevised?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pages">Pages</Label>
            <Input id="pages" type="number" {...register("pages")} placeholder="e.g. 64" />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Classification ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Classification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Policy Guidance Tier */}
          <div className="space-y-1.5">
            <Label>Policy Guidance Tier</Label>
            <Select
              value={watch("policyGuidanceTier")?.toString() ?? "none"}
              onValueChange={(v) => {
                const parsed = v === "none" ? null : parseInt(v);
                setValue("policyGuidanceTier", parsed);
                // Clear strategy whenever tier moves away from Tier 4
                if (parsed !== 4) setValue("strategyTier", null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {TIERS.map((t) => (
                  <SelectItem key={t.value} value={String(t.value)}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strategy Classification — only available for Tier 4 records */}
          {(() => {
            const isStrategyEnabled = watch("policyGuidanceTier") === 4;
            return (
              <div className="space-y-1.5">
                <Label className={isStrategyEnabled ? undefined : "text-muted-foreground"}>
                  Strategy Classification
                </Label>
                <Select
                  value={watch("strategyTier")?.toString() ?? "none"}
                  onValueChange={(v) =>
                    setValue("strategyTier", v === "none" ? null : parseInt(v))
                  }
                  disabled={!isStrategyEnabled}
                >
                  <SelectTrigger className={!isStrategyEnabled ? "opacity-50 cursor-not-allowed" : undefined}>
                    <SelectValue placeholder="Select strategy type…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {STRATEGY_TYPES.map((s) => (
                      <SelectItem key={s.value} value={String(s.value)}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isStrategyEnabled && (
                  <p className="text-xs text-muted-foreground">
                    Only available for <span className="font-medium">Tier 4 — Strategies for Project Prioritization &amp; Alignment</span> records.
                  </p>
                )}
              </div>
            );
          })()}

        </div>
      </section>

      <Separator />

      {/* ── Content ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Content
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              {...register("overview")}
              placeholder="Brief description of the document's scope and purpose…"
              rows={5}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comment">Internal Comment</Label>
            <Textarea
              id="comment"
              {...register("comment")}
              placeholder="Internal notes (not shown publicly)…"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link">External Link</Label>
            <Input id="link" type="url" {...register("link")} placeholder="https://…" />
            <FieldError message={errors.link?.message} />
          </div>
        </div>
      </section>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />{mode === "create" ? "Create Record" : "Save Changes"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
