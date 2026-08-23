import { useEffect, useRef, useState } from 'react';
import { playBeep } from '../utils/beep';

const STORAGE_KEY = 'nordcore_rest_duration';
const DEFAULT_DURATION = 90;

export function useRestTimer() {
  const [duration, setDurationState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DURATION;
  });
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  function setDuration(value: number) {
    setDurationState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }

  function start() {
    // Created on this same user gesture (the set tick) so playback is already unlocked
    // by the time the countdown hits zero later, when there's no gesture to piggyback on.
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContext();
      } catch {
        // Web Audio unsupported — countdown still works visually
      }
    }
    setSecondsLeft(duration);
    setIsRunning(true);
  }

  function dismiss() {
    setIsRunning(false);
  }

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      playBeep(audioCtxRef.current);
      if ('vibrate' in navigator) navigator.vibrate(200);
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, secondsLeft]);

  return { duration, setDuration, secondsLeft, isRunning, start, dismiss };
}
