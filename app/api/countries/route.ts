import { NextResponse } from "next/server";
import { listCountries } from "@/modules/records/queries";

// GET /api/countries
export async function GET() {
  try {
    const countries = await listCountries();
    return NextResponse.json(countries);
  } catch (err) {
    console.error("[GET /api/countries]", err);
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}
