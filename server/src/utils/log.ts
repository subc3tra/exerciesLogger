import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

function appendLog(fileName: string, entry: string): void {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, fileName), entry + '\n');
}

export function logFeedback(username: string, message: string): void {
  const timestamp = new Date().toISOString();
  appendLog('feedback.md', `- **${timestamp}** — ${username}: ${message}`);
}

export function logLogin(username: string): void {
  const timestamp = new Date().toISOString();
  appendLog('logins.md', `- **${timestamp}** — ${username} logged in`);
}
