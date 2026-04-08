import { listRecords, listCountries, listDocCountsByCountry } from "@/modules/records/queries";
import { RecordTable } from "@/components/records/RecordTable";
// Stats icons not needed inline — removed unused imports

export const revalidate = 60; // ISR: re-fetch at most every 60 s

export default async function HomePage() {
  const [records, countries, docCounts] = await Promise.all([
    listRecords(),
    listCountries(),
    listDocCountsByCountry(),
  ]);

  const countriesWithDocs = countries.length;
  const totalDocs = records.length;

  // Build lookup for actual document counts from the documents table
  const docCountMap = new Map(docCounts.map((d) => [d.iso3, d]));

  // Build country summary for the dashboard table
  const countryMap = new Map(countries.map((c) => [c.iso3, c.name]));
  const summaryMap = new Map<
    string,
    { name: string; totalRecords: number; engDocs: number; nonEnglishDocs: number; latestUpdate: Date }
  >();

  for (const r of records) {
    const entry = summaryMap.get(r.country) ?? {
      name: countryMap.get(r.country) ?? r.country,
      totalRecords: 0,
      engDocs: 0,
      nonEnglishDocs: 0,
      latestUpdate: new Date(0),
    };
    entry.totalRecords++;
    const updated = new Date(r.updatedAt);
    if (updated > entry.latestUpdate) entry.latestUpdate = updated;
    summaryMap.set(r.country, entry);
  }

  // Merge actual document counts from the documents table
  for (const [iso3, entry] of summaryMap) {
    const counts = docCountMap.get(iso3);
    if (counts) {
      entry.engDocs = counts.engDocs;
      entry.nonEnglishDocs = counts.oriDocs;
    }
  }

  const totalEngDocs = docCounts.reduce((sum, d) => sum + d.engDocs, 0);
  const totalOriDocs = docCounts.reduce((sum, d) => sum + d.oriDocs, 0);

  const countrySummary = Array.from(summaryMap.entries())
    .map(([iso3, data]) => ({ iso3, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Country Policy Profile Repository
        </h1>
        <p className="mt-1 text-muted-foreground text-sm max-w-2xl">
          A curated database of Public Investment Management policy and strategy
          documents across countries. Each record references up to one English
          and one native-language version of the source document.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Countries
          </p>
          <p className="text-3xl font-bold mt-1">{countriesWithDocs}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Policy Records
          </p>
          <p className="text-3xl font-bold mt-1">{totalDocs}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            English Docs
          </p>
          <p className="text-3xl font-bold mt-1">{totalEngDocs}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Non-English Docs
          </p>
          <p className="text-3xl font-bold mt-1">{totalOriDocs}</p>
        </div>
      </div>

      {/* Main table */}
      <RecordTable records={records} countries={countries} countrySummary={countrySummary} />
    </div>
  );
}
