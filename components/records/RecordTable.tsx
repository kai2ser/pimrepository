"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TierBadge } from "./TierBadge";
import { TIERS, STRATEGY_TYPES } from "@/lib/tiers";
import type { PolicyRecord } from "@/drizzle/schema";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CountryOption { iso3: string; name: string; }

interface CountrySummaryRow {
  iso3: string;
  name: string;
  totalRecords: number;
  nonEnglishDocs: number;
  latestUpdate: Date;
}

interface RecordTableProps {
  records: PolicyRecord[];
  countries: CountryOption[];
  countrySummary?: CountrySummaryRow[];
}

export function RecordTable({ records, countries, countrySummary = [] }: RecordTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [policyTierFilter, setPolicyTierFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/records/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Record deleted");
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  // Build iso3 → display name lookup
  const countryNameMap = useMemo(
    () => new Map(countries.map((c) => [c.iso3, c.name])),
    [countries]
  );
  const resolveName = (iso3: string) => countryNameMap.get(iso3) ?? iso3;

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (countryFilter !== "all" && r.country !== countryFilter) return false;
      if (policyTierFilter !== "all" && r.policyGuidanceTier !== parseInt(policyTierFilter)) return false;
      if (strategyFilter !== "all" && r.strategyTier !== parseInt(strategyFilter)) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const cname = resolveName(r.country).toLowerCase();
        return (
          r.nameEng.toLowerCase().includes(q) ||
          cname.includes(q) ||
          r.country.toLowerCase().includes(q) ||
          (r.overview ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, countryFilter, policyTierFilter, strategyFilter, globalFilter, countryNameMap]);

  const columns: ColumnDef<PolicyRecord>[] = useMemo(
    () => [
      {
        accessorKey: "country",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Country
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="font-medium text-sm">{resolveName(row.original.country)}</span>
            <span className="block text-[10px] font-mono text-muted-foreground">{row.original.country}</span>
          </div>
        ),
      },
      {
        accessorKey: "nameEng",
        header: "Document Name",
        cell: ({ row }) => (
          <div className="max-w-xs">
            <Link
              href={`/records/${row.original.id}`}
              className="text-sm text-blue-700 hover:underline font-medium line-clamp-2"
            >
              {row.original.nameEng}
            </Link>
            {row.original.nameOrig && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                {row.original.nameOrig}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "year",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Year
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-center">
            <span>{row.original.year ?? "—"}</span>
            {row.original.yearRevised && (
              <span className="text-muted-foreground ml-1 text-xs">
                (rev. {row.original.yearRevised})
              </span>
            )}
          </div>
        ),
      },
      {
        id: "tiers",
        header: "Tiers",
        cell: ({ row }) => (
          <div className="flex gap-1 flex-wrap">
            <TierBadge tier={row.original.policyGuidanceTier} type="policy" />
            <TierBadge tier={row.original.strategyTier} type="strategy" />
          </div>
        ),
      },
      {
        accessorKey: "pages",
        header: "Pages",
        cell: ({ row }) => (
          <span className="text-sm text-center text-muted-foreground">
            {row.original.pages ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1 justify-end">
            {row.original.link && (
              <a
                href={row.original.link}
                target="_blank"
                rel="noopener noreferrer"
                title="External link"
              >
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            <Link href={`/records/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="View record">
                <FileText className="h-3.5 w-3.5" />
              </Button>
            </Link>
            {session && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Delete record"
                onClick={() => setDeleteId(row.original.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents, countries…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.iso3} value={c.iso3}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={policyTierFilter} onValueChange={setPolicyTierFilter}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Policy Guidance Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Policy Tiers</SelectItem>
              {TIERS.map((t) => (
                <SelectItem key={t.value} value={String(t.value)}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Strategy Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategy Types</SelectItem>
              {STRATEGY_TYPES.map((s) => (
                <SelectItem key={s.value} value={String(s.value)}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(countryFilter !== "all" || policyTierFilter !== "all" || strategyFilter !== "all" || globalFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCountryFilter("all");
                setPolicyTierFilter("all");
                setStrategyFilter("all");
                setGlobalFilter("");
              }}
              className="h-9 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {session && (
          <Link href="/records/new">
            <Button size="sm" className="h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Record
            </Button>
          </Link>
        )}
      </div>

      {/* Country summary dashboard */}
      {countrySummary.length > 0 && (
        <div className="rounded-md border">
          <button
            type="button"
            onClick={() => setDashboardOpen((v) => !v)}
            className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Country Overview
              <Badge variant="secondary" className="text-[10px] font-normal ml-1">
                {countrySummary.length}
              </Badge>
            </span>
            {dashboardOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {dashboardOpen && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Country</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[120px]">Records</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[150px]">Non-English Docs</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-right w-[140px]">Latest Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countrySummary.map((row) => (
                  <TableRow key={row.iso3} className="hover:bg-muted/30">
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{row.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {row.iso3}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {row.totalRecords}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-2">
                      {row.nonEnglishDocs > 0 ? (
                        <Badge variant="outline" className="text-xs font-medium">
                          {row.nonEnglishDocs}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2 text-sm text-muted-foreground tabular-nums">
                      {new Date(row.latestUpdate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {records.length} records
      </p>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/40">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open && !deleting) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              This will permanently delete the policy record and any uploaded
              document files. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
