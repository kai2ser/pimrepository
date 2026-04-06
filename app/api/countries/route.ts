import { NextResponse } from "next/server";
import { listAllCountries } from "@/modules/records/queries";

// GET /api/countries — returns all 195 countries from the lookup table
// Response: { iso3: string; name: string }[]
export async function GET() {
  try {
    const countries = await listAllCountries();
    return NextResponse.json(countries, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    console.error("[GET /api/countries]", err);
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}
