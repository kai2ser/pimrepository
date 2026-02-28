import { listPolicyCounts } from "@/modules/records/queries";
import CountriesClient from "./CountriesClient";

export const dynamic = "force-dynamic";

export default async function CountriesPage() {
  const counts = await listPolicyCounts();

  // Build a lookup map: iso3 → count
  const policyCounts: Record<string, number> = {};
  for (const { iso3, count } of counts) {
    policyCounts[iso3] = count;
  }

  return <CountriesClient policyCounts={policyCounts} />;
}
