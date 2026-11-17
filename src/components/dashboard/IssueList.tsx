import { IssueCard } from "./IssueCard";
import { Button } from "../ui";
import type { IssueFilter, ReviewIssue } from "../../types/review";

const severityFilters: Array<{ value: IssueFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function getFilters(
  findings: ReviewIssue[],
): Array<{ value: IssueFilter; label: string }> {
  const hasClassifiedFindings = findings.some(
    (finding) => finding.severity !== undefined,
  );
  const hasUnclassifiedFindings = findings.some(
    (finding) => finding.severity === undefined,
  );

  if (hasClassifiedFindings) {
    return [
      ...severityFilters,
      ...(hasUnclassifiedFindings
        ? [{ value: "unclassified" as const, label: "Unclassified" }]
        : []),
    ];
  }

  return [
    { value: "all" as const, label: "All" },
    ...Array.from(new Set(findings.map((finding) => finding.category))).map(
      (category) => ({
        value: `category:${category}` as const,
        label: category,
      }),
    ),
  ];
}

export function IssueList({
  findings,
  selectedFilter,
  onFilterChange,
  onCopyFinding,
}: {
  findings: ReviewIssue[];
  selectedFilter: IssueFilter;
  onFilterChange: (filter: IssueFilter) => void;
  onCopyFinding: (finding: ReviewIssue) => void;
}) {
  const filters = getFilters(findings);
  const visibleFindings =
    selectedFilter === "all"
      ? findings
      : selectedFilter === "unclassified"
        ? findings.filter((finding) => finding.severity === undefined)
        : selectedFilter.startsWith("category:")
          ? findings.filter(
              (finding) =>
                finding.category === selectedFilter.slice("category:".length),
            )
          : findings.filter((finding) => finding.severity === selectedFilter);

  return (
    <section className="dashboard-section" aria-labelledby="findings-title">
      <div className="dashboard-section__heading">
        <div>
          <p className="eyebrow">DETAILED ANALYSIS</p>
          <h3 id="findings-title">Feedback by review area</h3>
        </div>
        <span className="text-secondary">
          {visibleFindings.length} of {findings.length} review areas
        </span>
      </div>
      {filters.length > 1 && (
        <div
          className="issue-filters"
          role="group"
          aria-label="Filter review areas"
        >
          {filters.map(({ value, label }) => (
            <Button
              aria-pressed={selectedFilter === value}
              aria-controls="review-findings-list"
              key={value}
              onClick={() => onFilterChange(value)}
              size="small"
              variant={selectedFilter === value ? "secondary" : "ghost"}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
      <div className="visually-hidden" aria-live="polite">
        {visibleFindings.length} of {findings.length} review areas shown.
      </div>
      <div className="issue-list" id="review-findings-list">
        {visibleFindings.length > 0 ? (
          visibleFindings.map((finding) => (
            <IssueCard
              finding={finding}
              key={finding.id}
              onCopy={onCopyFinding}
            />
          ))
        ) : (
          <p className="issue-list__empty">
            {findings.length === 0
              ? "The workflow did not provide review-area comments."
              : "No review areas match this filter."}
          </p>
        )}
      </div>
    </section>
  );
}
