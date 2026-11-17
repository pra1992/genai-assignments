export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueFilter =
  | "all"
  | IssueSeverity
  | "unclassified"
  | `category:${string}`;

export interface CodeSnippet {
  kind: "existing" | "suggested";
  content: string;
}

export interface ReviewScore {
  category: string;
  score: number;
  maxScore: number;
}

export interface CodeCorrection {
  existing: CodeSnippet;
  suggested: CodeSnippet;
}

export interface ReviewIssue {
  id: string;
  title: string;
  severity?: IssueSeverity;
  description: string;
  category: string;
  lineNumber?: number;
  recommendation?: string;
  score?: number;
  scoreOutOf?: number;
  codeFix?: CodeCorrection;
}

export interface ReviewRecommendation {
  id: string;
  text: string;
}

export interface PositiveObservation {
  id: string;
  text: string;
}

export interface ReviewSummary {
  filename: string;
  repository: string;
  branch?: string;
  status: string;
  completedAt?: string;
  qualityScore?: number;
  qualityLabel?: string;
}

export interface ReviewResponse extends ReviewSummary {
  reportText: string;
  scoreBreakdown: ReviewScore[];
  findings: ReviewIssue[];
  recommendations: ReviewRecommendation[];
  positiveObservations: PositiveObservation[];
}

export interface CodeReviewRequest {
  githubUrl: string;
}
