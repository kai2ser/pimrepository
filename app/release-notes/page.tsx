import { RELEASES } from "@/data/release-notes";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Change type styling
const CHANGE_TYPE_STYLES = {
  feature: {
    label: "New",
    class: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  improvement: {
    label: "Improved",
    class: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  fix: {
    label: "Fixed",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  breaking: {
    label: "Breaking",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReleaseNotesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Release notes</h1>
        <p className="text-muted-foreground leading-relaxed max-w-xl">
          New updates and improvements to the PIM Country Policy Profile
          Repository. Each release note documents what changed, what was added,
          and any fixes applied to the platform.
        </p>
      </div>

      <Separator />

      {/* ── Release entries ─────────────────────────────────────────────── */}
      <div className="space-y-8">
        {RELEASES.map((release, i) => (
          <article
            key={release.version}
            className="group relative"
          >
            {/* Version header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {release.version}
                </span>
                {i === 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Latest
                  </Badge>
                )}
              </div>
              <time
                dateTime={release.date}
                className="text-xs text-muted-foreground"
              >
                {formatDate(release.date)}
              </time>
            </div>

            {/* Card */}
            <div className="rounded-xl border bg-muted/30 p-6 space-y-5">

              {/* Title + description */}
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold">{release.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {release.description}
                </p>
              </div>

              <Separator />

              {/* Change list */}
              <ul className="space-y-2.5">
                {release.changes.map((change, j) => {
                  const style = CHANGE_TYPE_STYLES[change.type];
                  return (
                    <li key={j} className="flex items-start gap-3">
                      {/* Dot */}
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`}
                      />
                      {/* Badge + text */}
                      <div className="flex items-start gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 mt-0.5 ${style.class}`}
                        >
                          {style.label}
                        </Badge>
                        <span className="text-sm text-foreground/90 leading-snug">
                          {change.text}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Connector line between releases */}
            {i < RELEASES.length - 1 && (
              <div className="absolute left-0 -bottom-5 w-px h-5 bg-border ml-0" />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
