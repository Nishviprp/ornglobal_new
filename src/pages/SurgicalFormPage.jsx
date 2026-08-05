import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Layout/Navbar'
import SurgicalProcedureForm from '../components/Forms/SurgicalProcedureForm'
import LoadingSpinner from '../components/Common/LoadingSpinner'

function SurgicalFormPage() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <SurgicalProcedureForm />
      </main>
    </div>
  )
}

export default SurgicalFormPage
