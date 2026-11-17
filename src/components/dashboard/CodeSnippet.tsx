import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { copyTextToClipboard } from "../../utils/clipboard";
import type { CodeSnippet as CodeSnippetData } from "../../types/review";

const keywordPattern =
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\b\d+\b|\b(?:abstract|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|true|false)\b)/g;
const javaKeywords = new Set(
  "abstract boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new null package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false".split(
    " ",
  ),
);

function renderJava(code: string) {
  return code.split(keywordPattern).map((token, index) => {
    if (!token) {
      return null;
    }

    let tokenClass: string | undefined;
    if (token.startsWith("//")) {
      tokenClass = "code-token--comment";
    } else if (token.startsWith('"') || token.startsWith("'")) {
      tokenClass = "code-token--string";
    } else if (/^\d+$/.test(token)) {
      tokenClass = "code-token--number";
    } else if (javaKeywords.has(token)) {
      tokenClass = "code-token--keyword";
    }

    return tokenClass ? (
      <span className={tokenClass} key={index}>
        {token}
      </span>
    ) : (
      token
    );
  });
}

export function CodeSnippet({ snippet }: { snippet: CodeSnippetData }) {
  const { kind, content } = snippet;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [copyError, setCopyError] = useState("");

  async function copyCode() {
    try {
      await copyTextToClipboard(content);
      setCopyState("copied");
    } catch (error) {
      setCopyState("error");
      setCopyError(
        error instanceof Error
          ? error.message
          : "Unable to copy code. Check clipboard permissions and try again.",
      );
    }
  }

  return (
    <div className={`code-snippet code-snippet--${kind}`}>
      <div className="code-snippet__header">
        <span>{kind === "existing" ? "Existing code" : "Suggested fix"}</span>
        <button
          className="code-snippet__copy"
          onClick={copyCode}
          type="button"
          aria-label={`Copy ${kind === "existing" ? "existing code" : "suggested code"}`}
        >
          {copyState === "copied" ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
          {copyState === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        tabIndex={0}
        aria-label={`${kind === "existing" ? "Existing" : "Suggested"} Java code`}
      >
        <code>{renderJava(content)}</code>
      </pre>
      {copyState === "error" && (
        <p className="code-snippet__error" role="alert">
          {copyError}
        </p>
      )}
      <span className="visually-hidden" aria-live="polite">
        {copyState === "copied" ? "Code copied." : ""}
      </span>
    </div>
  );
}
