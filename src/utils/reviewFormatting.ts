import type { ReviewIssue, ReviewResponse } from "../types/review";

export function formatFinding(finding: ReviewIssue): string {
  const lines = [finding.title, `Category: ${finding.category}`];

  if (finding.severity) {
    lines.unshift(`[${finding.severity.toUpperCase()}]`);
  }

  if (finding.lineNumber !== undefined) {
    lines.push(`Line: ${finding.lineNumber}`);
  }

  lines.push(`Description: ${finding.description}`);

  if (finding.recommendation) {
    lines.push(`Recommended action: ${finding.recommendation}`);
  }

  if (finding.score !== undefined && finding.scoreOutOf !== undefined) {
    lines.push(`Score: ${finding.score}/${finding.scoreOutOf}`);
  }

  if (finding.codeFix) {
    lines.push(
      "Existing code:",
      finding.codeFix.existing.content,
      "Suggested code:",
      finding.codeFix.suggested.content,
    );
  }

  return lines.join("\n");
}

export function formatReviewReport(review: ReviewResponse): string {
  if (review.reportText.trim()) {
    return review.reportText;
  }

  return [
    `Code review: ${review.filename}`,
    `Repository: ${review.repository}`,
    ...(review.branch ? [`Branch: ${review.branch}`] : []),
    ...(review.qualityScore !== undefined
      ? [
          `Quality score: ${review.qualityScore}/100${review.qualityLabel ? ` (${review.qualityLabel})` : ""}`,
        ]
      : ["Quality score: Not provided"]),
    "",
    "Findings:",
    ...review.findings.map(formatFinding),
    "",
    "Recommendations:",
    ...review.recommendations.map(
      (recommendation) => `- ${recommendation.text}`,
    ),
    "",
    "Positive observations:",
    ...review.positiveObservations.map(
      (observation) => `- ${observation.text}`,
    ),
  ].join("\n");
}
