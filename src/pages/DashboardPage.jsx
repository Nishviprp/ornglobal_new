import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Layout/Navbar'
import LoadingSpinner from '../components/Common/LoadingSpinner'

function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const firstName = user?.user_metadata?.first_name

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Welcome, {firstName || 'there'}!
        </h1>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/procedure/new')}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto sm:px-6"
          >
            Create New Surgical Procedure
          </button>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
