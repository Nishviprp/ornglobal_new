import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const PAGE_LABELS = {
  '/dashboard': null,
  '/procedure/new': 'Creating Procedure',
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const firstName = user?.user_metadata?.first_name
  const pageLabel = PAGE_LABELS[location.pathname]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-blue-600 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <span className="text-lg font-bold tracking-tight">Ornglobal</span>
          {pageLabel && <span className="text-sm text-blue-100">{pageLabel}</span>}
        </div>

        {user && (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="text-sm sm:text-base">Hello, {firstName || user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-800 sm:w-auto"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
