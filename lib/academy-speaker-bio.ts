/** Sunucu + istemci aynı kırpma metnini kullansın (hydration uyumu). */
export const SPEAKER_BIO_COLLAPSE_AT = 300;

export function speakerBioDisplayParts(raw: string) {
  const trimmed = raw.replace(/\r\n/g, "\n").trim();
  if (trimmed.length === 0) {
    return { trimmed: "", preview: "", needsTruncate: false as const };
  }
  if (trimmed.length <= SPEAKER_BIO_COLLAPSE_AT) {
    return { trimmed, preview: trimmed, needsTruncate: false as const };
  }
  return {
    trimmed,
    preview: `${trimmed.slice(0, SPEAKER_BIO_COLLAPSE_AT)}...`,
    needsTruncate: true as const,
  };
}
