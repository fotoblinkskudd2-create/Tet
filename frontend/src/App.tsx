import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DebtDestroyer from './pages/DebtDestroyer'
import TruthEngine from './pages/TruthEngine'
import ActionTracker from './pages/ActionTracker'
import Offline from './pages/Offline'

function App() {
  useEffect(() => {
    // Check if we're offline
    const handleOnline = () => {
      console.log('Back online')
    }

    const handleOffline = () => {
      console.log('Gone offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="debt" element={<DebtDestroyer />} />
          <Route path="truth" element={<TruthEngine />} />
          <Route path="action" element={<ActionTracker />} />
          <Route path="offline" element={<Offline />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
