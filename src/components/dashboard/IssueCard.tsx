import { Badge } from "../ui";
import { Copy } from "lucide-react";
import type { ReviewIssue } from "../../types/review";
import { CodeSnippet } from "./CodeSnippet";

export function IssueCard({
  finding,
  onCopy,
}: {
  finding: ReviewIssue;
  onCopy: (finding: ReviewIssue) => void;
}) {
  return (
    <article className="issue-card card">
      <div className="issue-card__heading">
        <div>
          <div className="issue-card__meta">
            {finding.severity && (
              <Badge
                className={`severity-badge severity-badge--${finding.severity}`}
              >
                {finding.severity}
              </Badge>
            )}
            {finding.score !== undefined &&
              finding.scoreOutOf !== undefined && (
                <Badge>
                  {finding.score}/{finding.scoreOutOf}
                </Badge>
              )}
            <span className="issue-card__category">{finding.category}</span>
            {finding.lineNumber !== undefined && (
              <span className="issue-card__line">Line {finding.lineNumber}</span>
            )}
          </div>
          <h4>{finding.title}</h4>
        </div>
        <button
          className="issue-card__copy"
          onClick={() => onCopy(finding)}
          type="button"
          aria-label={`Copy finding: ${finding.title}`}
        >
          <Copy size={15} aria-hidden="true" />
          <span>Copy finding</span>
        </button>
      </div>
      <p className="issue-card__description">{finding.description}</p>
      {finding.recommendation && (
        <div className="issue-card__recommendation">
          <span>Recommended action</span>
          <p>{finding.recommendation}</p>
        </div>
      )}
      {finding.codeFix && (
        <div className="issue-card__code">
          <CodeSnippet snippet={finding.codeFix.existing} />
          <CodeSnippet snippet={finding.codeFix.suggested} />
        </div>
      )}
    </article>
  );
}
