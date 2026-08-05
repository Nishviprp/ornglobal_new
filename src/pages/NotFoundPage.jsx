import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Page Not Found</h1>
      <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
      <Link
        to={isAuthenticated ? '/dashboard' : '/login'}
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Back to {isAuthenticated ? 'Dashboard' : 'Login'}
      </Link>
    </div>
  )
}

export default NotFoundPage
