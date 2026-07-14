import { useState } from 'react';
import { CHANGELOG } from '../data/changelog';

const STORAGE_KEY = 'nordcore_last_seen_version';

export function WhatsNewModal() {
  const latest = CHANGELOG[0];
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== latest.version);
  const [showAll, setShowAll] = useState(false);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, latest.version);
    setOpen(false);
  }

  if (!open) return null;

  const entries = showAll ? CHANGELOG : CHANGELOG.slice(0, 2);

  return (
    <div className="dialog-overlay" onClick={dismiss}>
      <div className="whats-new-card" onClick={(e) => e.stopPropagation()}>
        <span className="whats-new-badge">✨ New</span>
        {entries.map((entry) => (
          <div key={entry.version} className="whats-new-entry">
            <h3 className="dialog-title">{entry.title}</h3>
            <p className="whats-new-date">{entry.date}</p>
            <ul className="whats-new-list">
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="dialog-actions">
          {!showAll && CHANGELOG.length > 2 && (
            <button className="dialog-button secondary" onClick={() => setShowAll(true)}>
              See full changelog
            </button>
          )}
          <button className="dialog-button primary" onClick={dismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
