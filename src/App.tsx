import { AppLayout } from "./components/layout/AppLayout";
import { ReviewDashboard } from "./components/dashboard/ReviewDashboard";
import { ReviewForm } from "./components/review/ReviewForm";
import { n8nCodeReviewService } from "./services/n8nCodeReviewService";
import type { CodeReviewService } from "./services/codeReviewService";
import { useReviewWorkflow } from "./hooks/useReviewWorkflow";

type AppProps = {
  reviewService?: CodeReviewService;
};

export default function App({
  reviewService = n8nCodeReviewService,
}: AppProps) {
  const workflow = useReviewWorkflow(reviewService);

  return (
    <AppLayout>
      {workflow.review ? (
        <ReviewDashboard
          review={workflow.review}
          selectedFilter={workflow.selectedFilter}
          onFilterChange={workflow.handleFilterChange}
          onCopyFinding={workflow.handleCopyFinding}
          onCopyReport={workflow.handleCopyReport}
          onNewReview={workflow.handleNewReview}
          copyFeedback={workflow.copyFeedback}
        />
      ) : (
        <section className="review-page" aria-labelledby="review-title">
          <div className="review-page__intro">
            <p className="eyebrow">JAVA CODE INTELLIGENCE</p>
            <h1 id="review-title">Intelligent Java Code Review</h1>
            <p className="text-secondary">
              Analyze your Java code, uncover potential issues, and discover
              opportunities to improve code quality.
            </p>
          </div>
          <ReviewForm
            value={workflow.githubUrl}
            error={workflow.validationError}
            submissionError={workflow.submissionError}
            isLoading={workflow.isLoading}
            onChange={workflow.handleUrlChange}
            onSubmit={workflow.handleSubmit}
          />
        </section>
      )}
    </AppLayout>
  );
}
