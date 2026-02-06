import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionPage from './pages/AddTransactionPage';
import AccountsPage from './pages/AccountsPage';
import BudgetsPage from './pages/BudgetsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Laster...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/logg-inn" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Laster BergenBudget...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/logg-inn" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/registrer" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transaksjoner" element={<TransactionsPage />} />
                <Route path="/ny-transaksjon" element={<AddTransactionPage />} />
                <Route path="/kontoer" element={<AccountsPage />} />
                <Route path="/budsjetter" element={<BudgetsPage />} />
                <Route path="/rapporter" element={<ReportsPage />} />
                <Route path="/innstillinger" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
