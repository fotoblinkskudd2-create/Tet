import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Hjem' },
    { path: '/debt', icon: BanknotesIcon, label: 'Gjeld' },
    { path: '/truth', icon: ShieldCheckIcon, label: 'Sannhet' },
    { path: '/action', icon: BoltIcon, label: 'Handling' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-steel border-b border-blood px-4 py-4 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blood tracking-wider">FRIHET</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-steel border-t border-concrete">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive(path)
                  ? 'text-blood bg-concrete'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
