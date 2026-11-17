import type { FormEventHandler } from "react";
import { Alert, Card, LoadingIndicator } from "../ui";
import { GithubUrlInput } from "./GithubUrlInput";
import { ReviewButton } from "./ReviewButton";

type ReviewFormProps = {
  value: string;
  error?: string;
  submissionError?: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ReviewForm({
  value,
  error,
  submissionError,
  isLoading,
  onChange,
  onSubmit,
}: ReviewFormProps) {
  return (
    <Card className="review-form-card">
      <form className="review-form" noValidate onSubmit={onSubmit}>
        <GithubUrlInput
          value={value}
          error={error}
          disabled={isLoading}
          onChange={onChange}
        />
        <p className="review-form__format">
          Format: github.com/owner/repository/blob/branch/path/File.java
        </p>
        <p className="review-form__service-notice">
          The submitted URL is sent to the configured CodeLens AI review
          workflow.
        </p>
        <div className="review-form__action">
          <ReviewButton isLoading={isLoading} />
        </div>
        {isLoading && (
          <div className="review-form__loading">
            <LoadingIndicator label="Analyzing your Java code..." />
            <p>
              Reviewing code quality, best practices, and potential
              improvements.
            </p>
          </div>
        )}
        {submissionError && (
          <Alert
            className="review-form__feedback"
            tone="danger"
            role="alert"
            aria-live="assertive"
          >
            {submissionError}
          </Alert>
        )}
      </form>
    </Card>
  );
}
