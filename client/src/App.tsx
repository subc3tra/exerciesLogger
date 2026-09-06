import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';
import { Login } from './pages/Login';
import { IntakeForm } from './pages/IntakeForm';
import { Dashboard } from './pages/Dashboard';
import { SessionLogger } from './pages/SessionLogger';
import { Progression } from './pages/Progression';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/intake" element={<IntakeForm />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/session/:id" element={<SessionLogger />} />
        <Route path="/progression" element={<Progression />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
