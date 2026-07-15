// Add/edit/remove lines here freely — one is picked at random after each completed session.
// Future: also vary by time of day (e.g. a distinct morning message before 10am) — see TODO.md.
const COMPLETION_MESSAGES = [
  'Solid session — logged and in the books.',
  'Nice work — another one in the log.',
  'Session complete. Keep stacking these up.',
  'Done and dusted — solid effort today.',
  'Logged. Recovery starts now.',
  'That one counts. Good work.',
];

export function getCompletionMessage(): string {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
}
