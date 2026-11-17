import { Card } from "../ui";

type QualityScoreProps = {
  score?: number;
  label?: string;
};

export function QualityScore({ score, label }: QualityScoreProps) {
  const normalizedScore =
    score === undefined ? undefined : Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 48;
  const dashOffset =
    normalizedScore === undefined
      ? circumference
      : circumference * (1 - normalizedScore / 100);

  return (
    <Card className="quality-score">
      <h3>Code Quality Score</h3>
      <div
        className="quality-score__visual"
        aria-label={
          normalizedScore === undefined
            ? "Code quality score not provided"
            : `Code quality score: ${normalizedScore} out of 100`
        }
        role="img"
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle
            className="quality-score__track"
            cx="60"
            cy="60"
            r="48"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="quality-score__progress"
            cx="60"
            cy="60"
            r="48"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="quality-score__value">
          {normalizedScore ?? "—"}
        </span>
      </div>
      <span className="quality-score__label">
        {label ?? "Not provided by the workflow"}
      </span>
    </Card>
  );
}
