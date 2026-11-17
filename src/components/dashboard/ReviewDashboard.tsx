import type {
  IssueFilter,
  ReviewIssue,
  ReviewResponse,
} from "../../types/review";
import { IssueList } from "./IssueList";
import { PositiveObservations } from "./PositiveObservations";
import { QualityScore } from "./QualityScore";
import { RecommendationList } from "./RecommendationList";
import { ReportActions } from "./ReportActions";
import { ReviewSummary } from "./ReviewSummary";
import { ScoreBreakdown } from "./ScoreBreakdown";

export function ReviewDashboard({
  review,
  selectedFilter,
  onFilterChange,
  onCopyFinding,
  onCopyReport,
  onNewReview,
  copyFeedback,
}: {
  review: ReviewResponse;
  selectedFilter: IssueFilter;
  onFilterChange: (filter: IssueFilter) => void;
  onCopyFinding: (finding: ReviewIssue) => void;
  onCopyReport: () => void;
  onNewReview: () => void;
  copyFeedback?: { message: string; tone: "success" | "error" };
}) {
  return (
    <section className="review-dashboard" aria-labelledby="dashboard-title">
      <div className="review-dashboard__heading">
        <div>
          <p className="eyebrow">REVIEW RESULTS</p>
          <h1 id="dashboard-title">Code review overview</h1>
        </div>
      </div>
      <ReviewSummary summary={review} />
      <div className="review-dashboard__overview">
        <QualityScore
          score={review.qualityScore}
          label={review.qualityLabel}
        />
        <ScoreBreakdown scores={review.scoreBreakdown} />
      </div>
      <IssueList
        findings={review.findings}
        selectedFilter={selectedFilter}
        onFilterChange={onFilterChange}
        onCopyFinding={onCopyFinding}
      />
      <div className="review-dashboard__insights">
        <RecommendationList recommendations={review.recommendations} />
        <PositiveObservations observations={review.positiveObservations} />
      </div>
      <details className="full-review-report">
        <summary>View full workflow report</summary>
        <pre>{review.reportText}</pre>
      </details>
      <ReportActions
        onCopyReport={onCopyReport}
        onNewReview={onNewReview}
        copyFeedback={copyFeedback}
      />
    </section>
  );
}
