import { Github, X } from "lucide-react";
import { useId } from "react";

type GithubUrlInputProps = {
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function GithubUrlInput({
  value,
  error,
  disabled = false,
  onChange,
}: GithubUrlInputProps) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;

  return (
    <div className="github-url-field">
      <label className="field__label" htmlFor={inputId}>
        GitHub Java file URL
      </label>
      <div
        className={`github-url-field__control ${error ? "github-url-field__control--error" : ""}`}
      >
        <Github
          className="github-url-field__icon"
          size={19}
          aria-hidden="true"
        />
        <input
          autoComplete="url"
          className="github-url-field__input"
          id={inputId}
          inputMode="url"
          name="githubUrl"
          disabled={disabled}
          required
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://github.com/owner/repository/blob/main/path/File.java"
          spellCheck={false}
          type="url"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
        />
        {value && (
          <button
            aria-label="Clear GitHub URL"
            className="github-url-field__clear"
            disabled={disabled}
            onClick={() => onChange("")}
            type="button"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <div
        className={`github-url-field__description ${error ? "github-url-field__description--error" : ""}`}
        id={descriptionId}
        role={error ? "alert" : undefined}
      >
        {error ??
          "Paste a link to a Java source file in a GitHub repository."}
      </div>
    </div>
  );
}
