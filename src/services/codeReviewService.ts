import type { CodeReviewRequest, ReviewResponse } from "../types/review";

export interface CodeReviewService {
  reviewCode(request: CodeReviewRequest): Promise<ReviewResponse>;
}
