import { useState } from 'react';
import { parseYoutubeLink } from '../utils/youtube';

interface ExerciseVideoProps {
  link: string | null;
}

// Collapsed-by-default video toggle, same shape as the Description block right above it.
// A recognized YouTube link (video, youtu.be, or Shorts) gets a lazy-mounted inline embed —
// the iframe isn't in the DOM at all until opened, so a collapsed row costs nothing. Anything
// else (the bank has some non-YouTube links, e.g. exorlive.com) falls back to a plain external
// link instead of trying to embed something that isn't YouTube.
export function ExerciseVideo({ link }: ExerciseVideoProps) {
  const [expanded, setExpanded] = useState(false);

  if (!link) return null;

  const parsed = parseYoutubeLink(link);

  if (!parsed) {
    return (
      <a className="ex-video-link" href={link} target="_blank" rel="noopener noreferrer">
        <span className="block-label">▶ Watch video ↗</span>
      </a>
    );
  }

  return (
    <div className="ex-video-block">
      <button
        className="ex-description-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="block-label">Watch video</span>
        <span className="ex-description-caret">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded && (
        <div className={`ex-video-embed ${parsed.aspect === '9:16' ? 'vertical' : 'horizontal'}`}>
          <iframe
            src={parsed.embedUrl}
            title="Exercise instruction video"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
