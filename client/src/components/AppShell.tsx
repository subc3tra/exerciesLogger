import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FeedbackWidget } from './FeedbackWidget';
import { WhatsNewModal } from './WhatsNewModal';

export function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Outlet />
      </main>
      <FeedbackWidget />
      <WhatsNewModal />
    </div>
  );
}
