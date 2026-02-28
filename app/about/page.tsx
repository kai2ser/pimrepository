import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ── Tier definitions ─────────────────────────────────────────────────────────

const POLICY_TIERS = [
  {
    code: "Tier 1",
    label: "Primary Legislation",
    tagline: `the "why" and "what"`,
    color: {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      border: "border-l-blue-400",
    },
    body: `The foundational legal authority for PIM, typically established through an Organic Budget Law, Public Finance Management Law, or a dedicated Public Investment Law. This tier sets the overall objectives and principles of public investment, establishes which entities are subject to the rules, and defines key concepts. It should be durable and not change frequently. In most countries, this is where the mandate for PIM is anchored — without this, the framework lacks legal force.`,
  },
  {
    code: "Tier 2",
    label: "Secondary Regulations / Decrees",
    tagline: `the "who"`,
    color: {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      dot: "bg-indigo-500",
      border: "border-l-indigo-400",
    },
    body: `Regulations, decrees, or statutory instruments issued under the authority of Tier 1. They specify roles and responsibilities of different institutions (e.g., the Ministry of Finance, sector ministries, line agencies), set the rules of the process in more detail, and establish accountability and compliance requirements. They are more specific than primary legislation but still relatively high-level.`,
  },
  {
    code: "Tier 3",
    label: "Procedural Guidelines and Methodological Guidance",
    tagline: `the "how"`,
    color: {
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      dot: "bg-violet-500",
      border: "border-l-violet-400",
    },
    body: `Operational manuals, circulars, and technical guidelines that provide the practical step-by-step instructions for how to carry out appraisal, selection, implementation and evaluation of projects. This is where, for example, cost-benefit analysis methodology and project appraisal templates live. These can and should be updated relatively frequently as practice evolves.`,
  },
  {
    code: "Tier 4",
    label: "Strategies for Project Prioritization & Alignment",
    tagline: null,
    color: {
      badge: "bg-teal-50 text-teal-700 border-teal-200",
      dot: "bg-teal-500",
      border: "border-l-teal-400",
    },
    body: null,
  },
];

const STRATEGY_TYPES = [
  { num: 1, label: "National (Longer Term, 5 Years+)" },
  { num: 2, label: "Medium Term (3–5 years)" },
  { num: 3, label: "Sectoral" },
  { num: 4, label: "Cross-Cutting (Climate)" },
  { num: 5, label: "Cross-Cutting (Other)" },
  { num: 6, label: "Sub-National Strategy" },
];

const REFERENCES = [
  {
    citation:
      "Kim, J.-H., Fallov, J. A., & Groom, S. (2020). Public Investment Management Reference Guide. Washington, DC: World Bank International Development in Practice, pp. 279.",
    url: "https://openknowledge.worldbank.org/server/api/core/bitstreams/2e0fa0e5-254e-5119-ab70-4ebfebc3f8ef/content",
    linkLabel: "Open Knowledge Repository",
  },
  {
    citation:
      "Manescu, C. B. (2024). The Planning of Public Investments in EU Member States: Long-Term Strategy, Selection & Budgeting Issues. Brussels: European Commission Directorate-General for Economic and Financial Affairs, European Economy Discussion Papers, 213, December, pp. 36.",
    url: "https://economy-finance.ec.europa.eu/publications/planning-public-investments-eu-member-states-long-term-strategy-selection-and-budgeting-issues_en",
    linkLabel: "European Commission Publications",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            The{" "}
            <a
              href="https://pim-pam.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-blue-600 transition-colors"
            >
              pim-pam.net
            </a>{" "}
            Global Public Investment Management (PIM) Policies AI Repository
            provides a systematic online resource for the comparative review of{" "}
            <em>de jure</em> institutional contexts, as well as online decision
            support for core and climate-informed project preparation, resourcing,
            and delivery. The PIM Policies repository is a dynamic resource
            designed to capture all relevant national and, as pertinent,
            sub-national PIM policy guidelines.
          </p>
          <p>
            The PIM Country Policy Repositories serve to (i) provide interactive
            AI-powered guidance to key PIM process participants (especially project
            proponents at national, sub-national, and state-owned levels), and
            (ii) provide a PIM policy comprehensiveness profile (benchmarked
            against global good practices).
          </p>
          <p>
            The policy documents are organized within a three-tier hierarchy of
            policy guidance that a good PIM framework should have, as identified
            in Kim et al. (2020),{" "}
            <em>PIM Reference Guide Chapter 3</em>, specifically the InfraGov 2.0
            Dimensions 9 Institutional Design and 1 (PIM Project Guidance). A
            fourth category is dedicated to strategies considered for project
            prioritization and alignment, organized into national (long versus
            medium term), sectoral, cross-cutting (e.g., climate),
            cross-cutting (e.g., other), and sub-national categories.
          </p>
        </div>
      </div>

      <Separator />

      {/* ── Policy Document Classifications ─────────────────────────────── */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            PIM Policy Document Classifications
          </h2>
          <p className="text-sm text-muted-foreground">
            A three-tier hierarchy plus a strategic alignment category.
          </p>
        </div>

        <div className="space-y-4">
          {POLICY_TIERS.map((tier) => (
            <div
              key={tier.code}
              className={`rounded-xl border bg-muted/20 border-l-4 ${tier.color.border} p-5 space-y-2`}
            >
              {/* Tier header */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold px-2.5 py-0.5 ${tier.color.badge}`}
                >
                  {tier.code}
                </Badge>
                <span className="font-semibold text-sm">{tier.label}</span>
                {tier.tagline && (
                  <span className="text-xs text-muted-foreground italic">
                    — {tier.tagline}
                  </span>
                )}
              </div>

              {/* Tier body */}
              {tier.body && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tier.body}
                </p>
              )}

              {/* Tier 4 → Strategy sub-list */}
              {tier.code === "Tier 4" && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Strategy documents classified under Tier 4 are further
                    categorized by the following strategy types:
                  </p>
                  <ol className="space-y-1.5 mt-2">
                    {STRATEGY_TYPES.map((s) => (
                      <li
                        key={s.num}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-[11px] font-semibold shrink-0">
                          {s.num}
                        </span>
                        {s.label}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Selected References ─────────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Selected References
        </h2>
        <ul className="space-y-5">
          {REFERENCES.map((ref, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-1 h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ref.citation}
                </p>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {ref.linkLabel} ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
