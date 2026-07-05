import { useState } from 'react';

const STORAGE_KEY = 'nordcore_info_banner_expanded';

function getInitialExpanded(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

export function InfoBanner() {
  const [expanded, setExpanded] = useState(getInitialExpanded);

  function toggle() {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="info-banner">
      <button className="info-banner-header" onClick={toggle} aria-expanded={expanded}>
        <span className="info-banner-title">🧪 Testing phase</span>
        <span className="info-banner-caret">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="info-banner-body">
          <p>You're using an early test version of NordCore — things may still change or break as it's refined.</p>
          <ul>
            <li>Tap a program to see its week-by-week schedule.</li>
            <li>Tap a day to see what it's made of before you start.</li>
            <li>Hit Start/Continue on the highlighted day to log a workout.</li>
          </ul>
          <p>
            Found a bug or have an idea? Tap the <strong>💬</strong> button in the bottom-left corner anytime —
            it goes straight to the developer.
          </p>
        </div>
      )}
    </div>
  );
}
