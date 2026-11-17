import { Badge } from "../ui";
import type { ReviewSummary as ReviewSummaryData } from "../../types/review";

export function ReviewSummary({ summary }: { summary: ReviewSummaryData }) {
  return (
    <section className="review-summary card" aria-label="Review summary">
      <div className="review-summary__file">
        <p className="eyebrow">JAVA FILE</p>
        <h2>{summary.filename}</h2>
        <p className="review-summary__repository">{summary.repository}</p>
      </div>
      <div className="review-summary__metadata">
        {summary.branch && (
          <div>
            <span className="review-summary__label">Branch</span>
            <code>{summary.branch}</code>
          </div>
        )}
        <div>
          <span className="review-summary__label">Status</span>
          <Badge tone="success">{summary.status}</Badge>
        </div>
        {summary.completedAt && (
          <div>
            <span className="review-summary__label">Completed</span>
            <span>{summary.completedAt}</span>
          </div>
        )}
      </div>
    </section>
  );
}
