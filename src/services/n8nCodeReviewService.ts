import type { CodeReviewRequest, ReviewResponse } from "../types/review";
import { mapN8nReviewResponse } from "../utils/n8nResponseMapper";
import type { CodeReviewService } from "./codeReviewService";

const REQUEST_TIMEOUT_MS = 70_000;

function getWebhookUrl(): string {
  const configuredUrl = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim();
  if (!configuredUrl) {
    throw new Error(
      "The review service is not configured. Set VITE_N8N_WEBHOOK_URL and restart the app.",
    );
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("The configured n8n webhook URL is invalid.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("The configured n8n webhook URL is invalid.");
  }

  return url.toString();
}

function getHttpError(status: number): Error {
  switch (status) {
    case 400:
      return new Error("The n8n workflow rejected the review request.");
    case 401:
      return new Error("The n8n webhook requires authentication.");
    case 403:
      return new Error("The n8n webhook denied access to this review.");
    case 404:
      return new Error("The n8n production webhook was not found.");
    case 429:
      return new Error("The review service is busy. Please try again shortly.");
    case 502:
    case 503:
      return new Error("The n8n review service is temporarily unavailable.");
    default:
      if (status >= 500) {
        return new Error("The n8n workflow failed while processing the review.");
      }

      return new Error(`The n8n workflow returned HTTP ${status}.`);
  }
}

export class N8nCodeReviewService implements CodeReviewService {
  async reviewCode(request: CodeReviewRequest): Promise<ReviewResponse> {
    const webhookUrl = getWebhookUrl();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      let response: Response;
      try {
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ originalUrl: request.githubUrl }),
          credentials: "omit",
          signal: controller.signal,
        });
      } catch {
        if (controller.signal.aborted) {
          throw new Error(
            "The review workflow exceeded its 70-second response limit. Please try again.",
          );
        }

        throw new Error(
          "Unable to reach the n8n workflow. Check that n8n is running and allows requests from this frontend.",
        );
      }

      if (!response.ok) {
        throw getHttpError(response.status);
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("The n8n workflow returned invalid JSON.");
      }

      return mapN8nReviewResponse(payload, request);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
}

export const n8nCodeReviewService = new N8nCodeReviewService();
