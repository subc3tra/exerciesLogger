import { useState } from 'react';
import { CHANGELOG } from '../data/changelog';

const STORAGE_KEY = 'nordcore_last_seen_version';

export function WhatsNewModal() {
  const latest = CHANGELOG[0];
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== latest.version);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, latest.version);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={dismiss}>
      <div className="whats-new-card" onClick={(e) => e.stopPropagation()}>
        <span className="whats-new-badge">✨ New</span>
        <h3 className="dialog-title">{latest.title}</h3>
        <ul className="whats-new-list">
          {latest.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
        <div className="dialog-actions">
          <button className="dialog-button primary" onClick={dismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
