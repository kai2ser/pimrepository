export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { policyRecords } from "@/drizzle/schema";
import { requireAuth } from "@/lib/auth";

const SEED_RECORDS = [
  {
    country: "South Africa",
    nameEng: "Public Finance Management Act (PFMA), No. 1 of 1999",
    nameOrig: null,
    year: 1999,
    source: "National Treasury",
    yearRevised: 2017,
    overview:
      "The PFMA is the foundational legislation governing financial management across national and provincial government. It establishes Treasury mandates, budget processes, and accountability frameworks for public funds.",
    policyGuidanceTier: 1,
    strategyTier: null,
    link: "https://www.treasury.gov.za/legislation/pfma/",
    pages: 64,
    tokens: 42000,
  },
  {
    country: "Lithuania",
    nameEng: "Law on Strategic Management",
    nameOrig: "Strateginio valdymo įstatymas",
    year: 2020,
    source: "Seimas of Lithuania",
    yearRevised: 2024,
    overview:
      "Primary legislation requiring that investment projects derive from the National Progress Plan and regional development plans. Establishes the national strategic planning framework.",
    policyGuidanceTier: null,
    strategyTier: 1,
    link: "https://e-seimas.lrs.lt/",
    pages: 21,
    tokens: 14200,
  },
  {
    country: "Colombia",
    nameEng: "National Development Plan 2022–2026: Colombia, a World Power of Life",
    nameOrig: "Plan Nacional de Desarrollo 2022–2026: Colombia, Potencia Mundial de la Vida",
    year: 2022,
    source: "DNP – Departamento Nacional de Planeación",
    yearRevised: null,
    overview:
      "Four-year national development plan establishing strategic priorities, investment allocations, and institutional arrangements for public investment management across all sectors.",
    policyGuidanceTier: 1,
    strategyTier: 1,
    link: "https://www.dnp.gov.co/Plan-Nacional-de-Desarrollo/",
    pages: 312,
    tokens: 210000,
  },
  {
    country: "Kenya",
    nameEng: "Public Finance Management Act, 2012",
    nameOrig: null,
    year: 2012,
    source: "National Treasury of Kenya",
    yearRevised: 2021,
    overview:
      "Establishes the legal framework for the management of public finances at national and county government levels, including budgeting, reporting, and accountability provisions.",
    policyGuidanceTier: 1,
    strategyTier: null,
    link: "https://www.treasury.go.ke/",
    pages: 130,
    tokens: 88000,
  },
  {
    country: "Kenya",
    nameEng: "Kenya Vision 2030: Second Medium-Term Plan",
    nameOrig: null,
    year: 2013,
    source: "State Department for Planning",
    yearRevised: null,
    overview:
      "Second medium-term plan under Kenya Vision 2030, detailing public investment priorities across economic, social, and political pillars for the 2013–2017 period.",
    policyGuidanceTier: null,
    strategyTier: 2,
    link: "https://vision2030.go.ke/",
    pages: 197,
    tokens: 132000,
  },
  {
    country: "Vietnam",
    nameEng: "Law on Public Investment No. 39/2019/QH14",
    nameOrig: "Luật Đầu tư công số 39/2019/QH14",
    year: 2019,
    source: "National Assembly of Vietnam",
    yearRevised: 2022,
    overview:
      "Comprehensive law regulating the management and use of public investment capital. Covers project appraisal, approval, implementation, and monitoring across all government levels.",
    policyGuidanceTier: 1,
    strategyTier: null,
    link: "https://thuvienphapluat.vn/",
    pages: 58,
    tokens: 39000,
  },
  {
    country: "Indonesia",
    nameEng: "Government Regulation No. 17/2017 on Synchronization of Planning and Budgeting",
    nameOrig: "Peraturan Pemerintah No. 17 Tahun 2017",
    year: 2017,
    source: "BAPPENAS / Ministry of Finance",
    yearRevised: null,
    overview:
      "Regulation requiring alignment between national planning (RPJMN/RKP) and budget formulation (APBN) to strengthen the results chain from policy to spending.",
    policyGuidanceTier: 2,
    strategyTier: 1,
    link: "https://jdih.setkab.go.id/",
    pages: 45,
    tokens: 30000,
  },
  {
    country: "Morocco",
    nameEng: "Organic Law No. 130-13 on the Finance Law",
    nameOrig: "Loi Organique n° 130-13 relative à la Loi de Finances",
    year: 2015,
    source: "Ministry of Economy and Finance",
    yearRevised: null,
    overview:
      "Modernises the public financial management framework in Morocco, introducing program-based budgeting, performance frameworks, and multi-year fiscal planning.",
    policyGuidanceTier: 1,
    strategyTier: null,
    link: "https://www.finances.gov.ma/",
    pages: 39,
    tokens: 26000,
  },
  {
    country: "Georgia",
    nameEng: "Basic Data and Directions Document (BDD) 2023–2026",
    nameOrig: "ძირითადი მონაცემები და მიმართულებები",
    year: 2022,
    source: "Ministry of Finance of Georgia",
    yearRevised: null,
    overview:
      "Medium-term macrofiscal and expenditure framework linking strategic priorities to resource allocation. Serves as the foundation for annual budget formulation.",
    policyGuidanceTier: 2,
    strategyTier: 2,
    link: "https://mof.ge/",
    pages: 88,
    tokens: 59000,
  },
  {
    country: "Philippines",
    nameEng: "General Appropriations Act FY 2024",
    nameOrig: null,
    year: 2023,
    source: "Department of Budget and Management",
    yearRevised: null,
    overview:
      "Annual national budget law defining appropriations for all national government agencies. Includes capital outlay provisions and conditions for public investment project releases.",
    policyGuidanceTier: 3,
    strategyTier: null,
    link: "https://www.dbm.gov.ph/",
    pages: 420,
    tokens: 285000,
  },
];

export async function POST() {
  const authResult = await requireAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    // Only seed if table is empty
    const existing = await db.select({ id: policyRecords.id }).from(policyRecords).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: "Already seeded", count: 0 });
    }

    const inserted = await db.insert(policyRecords).values(SEED_RECORDS).returning({ id: policyRecords.id });
    return NextResponse.json({ message: "Seeded successfully", count: inserted.length });
  } catch (err) {
    console.error("[POST /api/seed]", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
