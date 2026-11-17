export type GithubUrlValidation =
  | { valid: true }
  | { valid: false; error: string };

const EMPTY_URL_MESSAGE = "Please enter a GitHub file URL.";
const INVALID_URL_MESSAGE = "Please enter a valid GitHub URL.";
const UNSUPPORTED_URL_MESSAGE =
  "Only GitHub repository file URLs are supported.";
const JAVA_FILE_MESSAGE = "Please provide a Java source file ending with .java.";

export function validateGithubJavaFileUrl(input: string): GithubUrlValidation {
  const value = input.trim();

  if (!value) {
    return { valid: false, error: EMPTY_URL_MESSAGE };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { valid: false, error: INVALID_URL_MESSAGE };
  }

  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    url.username ||
    url.password ||
    url.port
  ) {
    return { valid: false, error: UNSUPPORTED_URL_MESSAGE };
  }

  let pathSegments: string[];
  try {
    pathSegments = url.pathname
      .split("/")
      .slice(1)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    return { valid: false, error: INVALID_URL_MESSAGE };
  }

  if (
    pathSegments.length < 5 ||
    pathSegments.some((segment) => !segment) ||
    pathSegments[2] !== "blob"
  ) {
    return { valid: false, error: UNSUPPORTED_URL_MESSAGE };
  }

  const fileName = pathSegments[pathSegments.length - 1];
  if (!fileName.toLowerCase().endsWith(".java")) {
    return { valid: false, error: JAVA_FILE_MESSAGE };
  }

  return { valid: true };
}
