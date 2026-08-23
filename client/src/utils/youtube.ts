// Turns a raw YouTube URL (regular video, youtu.be short link, or Shorts) into an embeddable
// URL + which aspect ratio to render it at. Returns null for anything that isn't a recognized
// YouTube URL — the exercise bank's `link` field also holds non-YouTube links today (e.g. some
// entries point at exorlive.com), so callers need a graceful "just link out instead" fallback,
// not an assumption that every link is YouTube.
export interface ParsedYoutubeLink {
  embedUrl: string;
  aspect: '16:9' | '9:16';
}

export function parseYoutubeLink(rawUrl: string): ParsedYoutubeLink | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host !== 'youtube.com' && host !== 'youtu.be') return null;

  // Shorts: youtube.com/shorts/<id> — vertical
  const shortsMatch = url.pathname.match(/^\/shorts\/([\w-]+)/);
  if (shortsMatch) {
    return { embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`, aspect: '9:16' };
  }

  // Regular watch link: youtube.com/watch?v=<id> — horizontal
  if (host === 'youtube.com' && url.pathname === '/watch') {
    const id = url.searchParams.get('v');
    if (!id) return null;
    return { embedUrl: `https://www.youtube.com/embed/${id}`, aspect: '16:9' };
  }

  // Short link: youtu.be/<id> — horizontal
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    if (!id) return null;
    return { embedUrl: `https://www.youtube.com/embed/${id}`, aspect: '16:9' };
  }

  return null;
}
