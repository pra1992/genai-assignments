import { Copy, RotateCcw } from "lucide-react";
import { Button } from "../ui";

export function ReportActions({
  onCopyReport,
  onNewReview,
  copyFeedback,
}: {
  onCopyReport: () => void;
  onNewReview: () => void;
  copyFeedback?: { message: string; tone: "success" | "error" };
}) {
  return (
    <section className="report-actions" aria-label="Report actions">
      <div className="report-actions__buttons">
        <Button onClick={onCopyReport} variant="secondary">
          <Copy size={16} aria-hidden="true" />
          Copy report
        </Button>
        <Button onClick={onNewReview} variant="ghost">
          <RotateCcw size={16} aria-hidden="true" />
          Start new review
        </Button>
      </div>
      {copyFeedback && (
        <p
          className={`report-actions__feedback report-actions__feedback--${copyFeedback.tone}`}
          role={copyFeedback.tone === "error" ? "alert" : "status"}
          aria-live={copyFeedback.tone === "error" ? "assertive" : "polite"}
        >
          {copyFeedback.message}
        </p>
      )}
    </section>
  );
}
