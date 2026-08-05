import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabaseClient } from '../../services/supabaseClient'
import LoadingSpinner from '../Common/LoadingSpinner'

function ResetPassword() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let active = true

    supabaseClient.auth.getSession().then(({ data }) => {
      if (active) {
        setHasRecoverySession(!!data.session)
        setCheckingSession(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const validate = () => {
    const next = {}
    if (!password) {
      next.password = 'Password is required.'
    } else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your password.'
    } else if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setLoading(true)
    const { error } = await supabaseClient.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setSubmitError(error.message || 'Could not update your password. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (checkingSession) {
    return <LoadingSpinner />
  }

  if (!hasRecoverySession) {
    return (
      <div className="w-full text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Link invalid or expired</h2>
        <p className="mb-6 text-sm text-gray-600">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Login
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Password updated</h2>
        <p className="mb-6 text-sm text-gray-600">
          Your password has been updated successfully. You can now log in with your new password.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Set a new password</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: '' }))
                setSubmitError('')
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-gray-500 opacity-60 hover:opacity-100"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                setSubmitError('')
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-gray-500 opacity-60 hover:opacity-100"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Update Password
          </button>
        )}
      </form>
    </div>
  )
}

export default ResetPassword
