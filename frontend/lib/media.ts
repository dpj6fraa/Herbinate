const DEFAULT_MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export function getImageUrl(
  imageUrl?: string | null,
  fallback = "/placeholder.png"
) {
  if (!imageUrl) return fallback;

  const value = imageUrl.trim();
  if (!value) return fallback;

  if (ABSOLUTE_URL_PATTERN.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;

  const baseUrl = DEFAULT_MEDIA_BASE_URL.replace(/\/$/, "");
  const path = value.startsWith("/") ? value : `/${value}`;

  return `${baseUrl}${path}`;
}
