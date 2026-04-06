import type { Metadata } from "next";
import { listCountries, getRecordsWithDocsByCountry } from "@/modules/records/queries";
import DownloadClient from "./DownloadClient";

export const metadata: Metadata = {
  title: "Download — PIM Repository",
  description: "Download PIM policy and strategy documents by country in English and native languages.",
};

export const revalidate = 300; // ISR: re-fetch at most every 5 min

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ iso3?: string }>;
}) {
  const { iso3 } = await searchParams;

  // All countries that have at least one policy record (for the dropdown)
  const countries = await listCountries();

  // Records + documents for the selected country (empty if none selected)
  const rawRecords = iso3 ? await getRecordsWithDocsByCountry(iso3) : [];

  const records = rawRecords.map(({ record, docs }) => ({
    id: record.id,
    nameEng: record.nameEng,
    year: record.year,
    docs: docs.map((d) => ({
      id: d.id,
      langType: d.langType,
      langLabel: d.langLabel,
      fileName: d.fileName,
      fileSize: d.fileSize,
    })),
  }));

  return (
    <DownloadClient
      countries={countries}
      selectedIso3={iso3 ?? null}
      records={records}
    />
  );
}
