import { ScanSearch } from "lucide-react";
import {
  cloneElement,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
};

export function Button({
  variant = "primary",
  size = "medium",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} button--${size} ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const description = error ?? hint;

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        className={`field__input ${error ? "field__input--error" : ""} ${className}`.trim()}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={description ? descriptionId : undefined}
        {...props}
      />
      {description && (
        <span
          className={`field__description ${error ? "field__description--error" : ""}`}
          id={descriptionId}
        >
          {description}
        </span>
      )}
    </div>
  );
}

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return <div className={`card ${className}`.trim()} {...props} />;
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return <span className={`badge badge--${tone} ${className}`.trim()} {...props} />;
}

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "success" | "warning" | "danger";
};

export function Alert({
  tone = "info",
  className = "",
  ...props
}: AlertProps) {
  return (
    <div
      className={`alert alert--${tone} ${className}`.trim()}
      role="status"
      aria-live="polite"
      {...props}
    />
  );
}

export function Divider() {
  return <hr className="divider" />;
}

export function LoadingIndicator({ label = "Loading" }: { label?: string }) {
  return (
    <span className="loading-indicator" role="status" aria-label={label}>
      <span className="loading-indicator__spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
}) {
  const tooltipId = useId();
  const describedBy = [
    children.props["aria-describedby"],
    tooltipId,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className="tooltip">
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span className="tooltip__content" id={tooltipId} role="tooltip">
        {label}
      </span>
    </span>
  );
}

export function BrandMark() {
  return (
    <span className="brand-mark" aria-label="CodeLens AI">
      <span className="brand-mark__icon" aria-hidden="true">
        <ScanSearch size={20} strokeWidth={2.2} />
      </span>
      <span className="brand-mark__name">
        CodeLens <span>AI</span>
      </span>
    </span>
  );
}
