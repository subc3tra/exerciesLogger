import { useState } from 'react';

// A yes/no checkbox that reveals a text area when checked. Used for the intake form's
// "sensitive" fields (injuries, other training, etc.) — unchecking clears the value back
// to empty rather than leaving stale hidden text behind.
export function ToggleTextField({
  id,
  question,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  question: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [enabled, setEnabled] = useState(value !== '');

  function handleToggle(checked: boolean) {
    setEnabled(checked);
    if (!checked) {
      onChange('');
    }
  }

  return (
    <div className="intake-toggle-field">
      <label className="intake-checkbox-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={enabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        {question}
      </label>
      {enabled && (
        <textarea
          className="intake-textarea"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
