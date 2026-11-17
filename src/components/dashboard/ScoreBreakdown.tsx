import { Card } from "../ui";
import type { ReviewScore } from "../../types/review";

export function ScoreBreakdown({ scores }: { scores: ReviewScore[] }) {
  return (
    <Card
      className="score-breakdown"
      aria-labelledby="score-breakdown-title"
    >
      <div className="dashboard-section__heading">
        <div>
          <p className="eyebrow">SCORING CRITERIA</p>
          <h3 id="score-breakdown-title">Category scores</h3>
        </div>
      </div>
      {scores.length > 0 ? (
        <div className="score-breakdown__rows">
          {scores.map(({ category, score, maxScore }) => {
            const percentage = Math.min(100, (score / maxScore) * 100);

            return (
              <div className="score-breakdown__row" key={category}>
                <span className="score-breakdown__label">{category}</span>
                <div
                  className="score-breakdown__track"
                  role="img"
                  aria-label={`${category}: ${score} out of ${maxScore}`}
                >
                  <span
                    className="score-breakdown__bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="score-breakdown__value">
                  {score}/{maxScore}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-secondary">
          Category scores were not provided by the workflow.
        </p>
      )}
    </Card>
  );
}
