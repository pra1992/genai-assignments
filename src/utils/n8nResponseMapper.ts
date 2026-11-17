import type {
  CodeReviewRequest,
  PositiveObservation,
  ReviewIssue,
  ReviewRecommendation,
  ReviewResponse,
  ReviewScore,
} from "../types/review";

interface ScoreRow extends ReviewScore {
  comments: string;
}

function getTableCells(line: string): string[] | undefined {
  const trimmedLine = line.trim();
  if (!trimmedLine.startsWith("|") || !trimmedLine.endsWith("|")) {
    return undefined;
  }

  return trimmedLine
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function unwrapBold(value: string): string {
  const match = /^\*\*(.*?)\*\*$/.exec(value.trim());
  return match?.[1]?.trim() ?? value.trim();
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/```(?:[\w+-]+)?/g, " ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseScoreRows(reportText: string): ScoreRow[] {
  const rows: ScoreRow[] = [];
  let tableMaxScore: number | undefined;

  for (const line of reportText.split(/\r?\n/)) {
    const cells = getTableCells(line);
    if (!cells || cells.length < 3) {
      continue;
    }

    const tableMaxMatch = /score\s*\(\s*out of\s*(\d+)\s*\)/i.exec(
      cells[cells.length - 1],
    );
    if (tableMaxMatch) {
      tableMaxScore = Number(tableMaxMatch[1]);
      continue;
    }

    const category = unwrapBold(cells[0]);
    const inlineScore = cleanInlineMarkdown(cells[1]);
    const legacyScoreMatch = /^(\d+)\s*\/\s*(\d+)$/.exec(inlineScore);
    const tableScore = cleanInlineMarkdown(cells[cells.length - 1]);
    const tableScoreMatch =
      tableMaxScore === undefined ? undefined : /^(\d+)$/.exec(tableScore);

    if (!legacyScoreMatch && !tableScoreMatch) {
      continue;
    }

    const score = Number(legacyScoreMatch?.[1] ?? tableScoreMatch?.[1]);
    const maxScore = Number(legacyScoreMatch?.[2] ?? tableMaxScore);
    if (!category || maxScore <= 0 || score > maxScore) {
      throw new Error("The n8n report contains an invalid category score.");
    }

    rows.push({
      category,
      score,
      maxScore,
      comments: legacyScoreMatch
        ? cells.slice(2).join(" | ")
        : cells.slice(1, -1).join(" | "),
    });
  }

  return rows;
}

function parseCommentLines(comments: string): string[] {
  return comments
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n/)
    .map((line) =>
      cleanInlineMarkdown(line).replace(/^[\s•*-]+/, "").trim(),
    )
    .filter(Boolean);
}

function parseFindings(scoreRows: ScoreRow[]): ReviewIssue[] {
  return scoreRows.flatMap((row, index) => {
    if (row.category.toLowerCase() === "overall score") {
      return [];
    }

    const comments = parseCommentLines(row.comments);
    if (comments.length === 0) {
      return [];
    }

    return [
      {
        id: `review-area-${index}`,
        title: row.category,
        category: row.category,
        description: comments.join("\n"),
        score: row.score,
        scoreOutOf: row.maxScore,
      },
    ];
  });
}

function parseRecommendations(reportText: string): ReviewRecommendation[] {
  const sectionStart = reportText.indexOf(
    "## Actionable Feedback & Recommendations",
  );
  if (sectionStart < 0) {
    return [];
  }

  const sectionEnd = reportText.indexOf(
    "### Quick Refactor Example",
    sectionStart,
  );
  const section = reportText.slice(
    sectionStart,
    sectionEnd < 0 ? undefined : sectionEnd,
  );

  const tableRecommendations = section.split(/\r?\n/).flatMap((line, index) => {
    const cells = getTableCells(line);
    if (!cells || cells.length < 2) {
      return [];
    }

    const title = unwrapBold(cells[0]);
    const titleMatch = /^\d+\.\s*(.+)$/.exec(title);
    if (!titleMatch && !/^\*\*.+\*\*$/.test(cells[0])) {
      return [];
    }

    const action = cleanInlineMarkdown(cells[1]);
    const benefit = cleanInlineMarkdown(cells.slice(2).join(" | "));
    if (!action) {
      return [];
    }

    return [
      {
        id: `recommendation-${index}`,
        text: `${titleMatch?.[1] ?? title}: ${action}${benefit ? ` Benefit: ${benefit}` : ""}`,
      },
    ];
  });

  const listRecommendations: ReviewRecommendation[] = [];
  let title: string | undefined;
  let details: string[] = [];
  let inCodeBlock = false;

  const addListRecommendation = () => {
    if (title && details.length > 0) {
      listRecommendations.push({
        id: `recommendation-${listRecommendations.length}`,
        text: `${title}: ${details.join(" ")}`,
      });
    }
    title = undefined;
    details = [];
  };

  for (const line of section.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    const headingMatch = /^\s*\d+\.\s+\*\*(.+?)\*\*\s*$/.exec(line);
    if (headingMatch) {
      addListRecommendation();
      title = headingMatch[1].trim();
      continue;
    }

    if (!title || inCodeBlock) {
      continue;
    }

    const bulletMatch = /^\s*[*-]\s+(.+)$/.exec(line);
    if (bulletMatch) {
      const detail = cleanInlineMarkdown(bulletMatch[1]);
      if (detail) {
        details.push(detail);
      }
    }
  }
  addListRecommendation();

  return [...tableRecommendations, ...listRecommendations];
}

function parseOverallScore(reportText: string): ScoreRow | undefined {
  const match =
    /###\s*Overall Score\s*\r?\n\s*\*\*(\d+)\s*\/\s*(\d+)\*\*/i.exec(
      reportText,
    );

  if (!match) {
    return undefined;
  }

  return {
    category: "Overall Score",
    score: Number(match[1]),
    maxScore: Number(match[2]),
    comments: "",
  };
}

function parsePositiveObservations(
  reportText: string,
): PositiveObservation[] {
  const strengthsMatch =
    /^\s*-\s*\*\*Strengths:\*\*\s*(.+)$/im.exec(reportText);
  if (!strengthsMatch?.[1]) {
    return [];
  }

  const text = cleanInlineMarkdown(strengthsMatch[1]);
  return text
    ? [{ id: "workflow-strengths", text }]
    : [];
}

function getSourceDetails(githubUrl: string) {
  try {
    const pathSegments = new URL(githubUrl).pathname
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);

    if (pathSegments.length < 2) {
      throw new Error();
    }

    return {
      filename: pathSegments[pathSegments.length - 1],
      repository: `${pathSegments[0]}/${pathSegments[1]}`,
    };
  } catch {
    throw new Error(
      "The workflow response could not be associated with the submitted GitHub URL.",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getReportText(payload: unknown): string {
  let reportText: unknown;

  if (
    Array.isArray(payload) &&
    payload.length === 1 &&
    isRecord(payload[0])
  ) {
    reportText = payload[0].text;
  } else if (isRecord(payload)) {
    reportText = payload.codeReview;
  }

  if (typeof reportText !== "string" || !reportText.trim()) {
    throw new Error(
      "The n8n workflow returned an unexpected response. Check its Respond to Webhook output.",
    );
  }

  return reportText.trim();
}

export function mapN8nReviewResponse(
  payload: unknown,
  request: CodeReviewRequest,
): ReviewResponse {
  const reportText = getReportText(payload);
  const sourceDetails = getSourceDetails(request.githubUrl);
  const scoreRows = parseScoreRows(reportText);
  const overallScore =
    scoreRows.find(
      (row) => row.category.toLowerCase() === "overall score",
    ) ?? parseOverallScore(reportText);
  const allScoreRows =
    overallScore &&
    !scoreRows.some(
      (row) => row.category.toLowerCase() === "overall score",
    )
      ? [...scoreRows, overallScore]
      : scoreRows;
  const scoreBreakdown = allScoreRows
    .filter((row) => row.category.toLowerCase() !== "overall score")
    .map(({ category, score, maxScore }) => ({
      category,
      score,
      maxScore,
    }));

  return {
    ...sourceDetails,
    status: "Completed",
    qualityScore: overallScore
      ? Math.round((overallScore.score / overallScore.maxScore) * 100)
      : undefined,
    qualityLabel: overallScore ? "Overall score" : undefined,
    reportText,
    scoreBreakdown,
    findings: parseFindings(allScoreRows),
    recommendations: parseRecommendations(reportText),
    positiveObservations: parsePositiveObservations(reportText),
  };
}
