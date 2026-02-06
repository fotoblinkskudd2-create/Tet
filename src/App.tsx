import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { BudgetsPage } from '@/pages/BudgetsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { RecurringsPage } from '@/pages/RecurringsPage'
import { SettingsPage } from '@/pages/SettingsPage'

function ProtectedRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transaksjoner" element={<TransactionsPage />} />
        <Route path="/kontoer" element={<AccountsPage />} />
        <Route path="/budsjett" element={<BudgetsPage />} />
        <Route path="/rapporter" element={<ReportsPage />} />
        <Route path="/faste" element={<RecurringsPage />} />
        <Route path="/innstillinger" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <ProtectedRoutes /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
