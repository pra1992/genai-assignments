import { useState, type FormEventHandler } from "react";
import type { CodeReviewService } from "../services/codeReviewService";
import type {
  IssueFilter,
  ReviewIssue,
  ReviewResponse,
} from "../types/review";
import { copyTextToClipboard } from "../utils/clipboard";
import { validateGithubJavaFileUrl } from "../utils/githubUrlValidator";
import { formatFinding, formatReviewReport } from "../utils/reviewFormatting";

type CopyFeedback = {
  message: string;
  tone: "success" | "error";
};

export function useReviewWorkflow(reviewService: CodeReviewService) {
  const [githubUrl, setGithubUrl] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const [submissionError, setSubmissionError] = useState<string>();
  const [submissionState, setSubmissionState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<IssueFilter>("all");
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>();

  const isLoading = submissionState === "loading";

  function handleUrlChange(value: string) {
    setGithubUrl(value);
    setValidationError(undefined);
    setSubmissionError(undefined);
    setCopyFeedback(undefined);
    if (submissionState === "error") {
      setSubmissionState("idle");
    }
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    const validation = validateGithubJavaFileUrl(githubUrl);
    if (!validation.valid) {
      setValidationError(validation.error);
      setSubmissionError(undefined);
      setSubmissionState("error");
      return;
    }

    setValidationError(undefined);
    setSubmissionError(undefined);
    setCopyFeedback(undefined);
    setReview(null);
    setSelectedFilter("all");
    setSubmissionState("loading");

    try {
      const result = await reviewService.reviewCode({
        githubUrl: githubUrl.trim(),
      });
      setReview(result);
      setSubmissionState("success");
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? `Unable to process the review: ${error.message}`
          : "Something went wrong while processing the review. Please try again.",
      );
      setSubmissionState("error");
    }
  };

  async function copyContent(content: string, label: string) {
    try {
      await copyTextToClipboard(content);
      setCopyFeedback({ message: `${label} copied.`, tone: "success" });
    } catch (error) {
      setCopyFeedback({
        message:
          error instanceof Error
            ? `Unable to copy ${label.toLowerCase()}: ${error.message}`
            : `Unable to copy ${label.toLowerCase()}. Please try again.`,
        tone: "error",
      });
    }
  }

  function handleCopyFinding(finding: ReviewIssue) {
    void copyContent(formatFinding(finding), "Finding");
  }

  function handleCopyReport() {
    if (review) {
      void copyContent(formatReviewReport(review), "Review report");
    }
  }

  function handleNewReview() {
    setGithubUrl("");
    setValidationError(undefined);
    setSubmissionError(undefined);
    setSubmissionState("idle");
    setReview(null);
    setSelectedFilter("all");
    setCopyFeedback(undefined);
  }

  return {
    githubUrl,
    validationError,
    submissionError,
    isLoading,
    review,
    selectedFilter,
    copyFeedback,
    handleUrlChange,
    handleSubmit,
    handleFilterChange: setSelectedFilter,
    handleCopyFinding,
    handleCopyReport,
    handleNewReview,
  };
}
