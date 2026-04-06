import type { Metadata } from "next";
import { listPolicyCounts } from "@/modules/records/queries";
import CountriesClient from "./CountriesClient";

export const metadata: Metadata = {
  title: "Countries — PIM Repository",
  description: "Country reference data with GDP and public investment statistics for PIM policy analysis.",
};

export const revalidate = 3600; // ISR: re-fetch at most every hour

export default async function CountriesPage() {
  const counts = await listPolicyCounts();

  // Build a lookup map: iso3 → count
  const policyCounts: Record<string, number> = {};
  for (const { iso3, count } of counts) {
    policyCounts[iso3] = count;
  }

  return <CountriesClient policyCounts={policyCounts} />;
}
