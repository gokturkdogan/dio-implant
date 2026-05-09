"use client";

import { useState } from "react";

type Props = {
  /** Sunucuda normalize edilmiş tam metin */
  fullText: string;
  /** `needsTruncate` ise sunucunun ürettiği önizleme; değilse `fullText` ile aynı */
  previewText: string;
  needsTruncate: boolean;
};

export function AcademySpeakerBio({ fullText, previewText, needsTruncate }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!needsTruncate) {
    return <p className="acd-speaker-bio">{fullText}</p>;
  }

  return (
    <div className="acd-speaker-bio-wrap">
      <p className="acd-speaker-bio">{expanded ? fullText : previewText}</p>
      <button
        type="button"
        className="acd-speaker-bio-more"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Daha az göster" : "Daha fazla görüntüle"}
      </button>
    </div>
  );
}
