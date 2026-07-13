interface RestTimerProps {
  secondsLeft: number;
  onDismiss: () => void;
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RestTimer({ secondsLeft, onDismiss }: RestTimerProps) {
  return (
    <button className="rest-timer" onClick={onDismiss} aria-label="Dismiss rest timer">
      <span className="rest-timer-label">Rest</span>
      <span className="rest-timer-value">{formatSeconds(secondsLeft)}</span>
    </button>
  );
}
