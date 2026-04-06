import { listRecords, listCountries } from "@/modules/records/queries";
import { RecordTable } from "@/components/records/RecordTable";
// Stats icons not needed inline — removed unused imports

export const revalidate = 60; // ISR: re-fetch at most every 60 s

export default async function HomePage() {
  const [records, countries] = await Promise.all([
    listRecords(),
    listCountries(),
  ]);

  const countriesWithDocs = countries.length;
  const totalDocs = records.length;
  const withNative = records.filter((r) => r.nameOrig).length;

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            With Native Language
          </p>
          <p className="text-3xl font-bold mt-1">{withNative}</p>
        </div>
      </div>

      {/* Main table */}
      <RecordTable records={records} countries={countries} />
    </div>
  );
}
