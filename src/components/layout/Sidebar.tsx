import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  Repeat,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useStore } from '@/lib/store'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Oversikt' },
  { to: '/transaksjoner', icon: ArrowLeftRight, label: 'Transaksjoner' },
  { to: '/kontoer', icon: Wallet, label: 'Kontoer' },
  { to: '/budsjett', icon: Target, label: 'Budsjett' },
  { to: '/rapporter', icon: PieChart, label: 'Rapporter' },
  { to: '/faste', icon: Repeat, label: 'Faste utgifter' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const logout = useStore((s) => s.logout)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fjord-500 to-fjord-700 flex items-center justify-center text-white font-bold text-sm shadow-glow">
              B
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">BergenBudget</h1>
              <p className="text-[11px] text-slate-500">Personlig okonomi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-fjord-600/20 text-fjord-400 shadow-neu-sm border border-fjord-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )
              }
              end={item.to === '/'}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <NavLink
            to="/innstillinger"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-fjord-600/20 text-fjord-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )
            }
          >
            <Settings size={18} />
            Innstillinger
          </NavLink>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-all duration-200"
          >
            <LogOut size={18} />
            Logg ut
          </button>
        </div>
      </aside>
    </>
  )
}
