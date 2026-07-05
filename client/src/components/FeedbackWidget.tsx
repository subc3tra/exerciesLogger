import { useState, type FormEvent } from 'react';
import { feedbackApi } from '../services/api';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    try {
      await feedbackApi.send(message.trim());
      setMessage('');
      setStatus('sent');
      setTimeout(() => {
        setStatus('idle');
        setIsOpen(false);
      }, 1200);
    } catch {
      setStatus('idle');
    }
  }

  if (!isOpen) {
    return (
      <button className="feedback-bubble" onClick={() => setIsOpen(true)} aria-label="Send feedback">
        💬
      </button>
    );
  }

  return (
    <div className="feedback-panel">
      <div className="feedback-header">
        <span>Feedback</span>
        <button className="feedback-close" onClick={() => setIsOpen(false)} aria-label="Close">
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit} className="feedback-form">
        <textarea
          className="feedback-textarea"
          placeholder="Found a bug? Have an idea?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          disabled={status !== 'idle'}
        />
        <button className="feedback-send" type="submit" disabled={status !== 'idle' || !message.trim()}>
          {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Send'}
        </button>
      </form>
    </div>
  );
}
