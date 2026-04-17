const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function toAppImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl || "";
  }

  if (imageUrl.startsWith("data:") || imageUrl.startsWith("/media/")) {
    return imageUrl;
  }

  if (API_BASE_URL && imageUrl.startsWith(`${API_BASE_URL}/media/`)) {
    return imageUrl;
  }

  if (!imageUrl.includes(".amazonaws.com/")) {
    return imageUrl;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const objectKey = parsedUrl.pathname.replace(/^\/+/, "");

    if (!objectKey) {
      return imageUrl;
    }

    return API_BASE_URL
      ? `${API_BASE_URL}/media/${objectKey}`
      : `/media/${objectKey}`;
  } catch {
    return imageUrl;
  }
}
