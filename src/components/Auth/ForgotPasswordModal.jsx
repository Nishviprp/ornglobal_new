import { useState } from 'react'
import { supabaseClient } from '../../services/supabaseClient'
import LoadingSpinner from '../Common/LoadingSpinner'

function ForgotPasswordModal({ initialEmail = '', onClose }) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }

    setError('')
    setSending(true)
    const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/ornglobal/reset-password`,
    })
    setSending(false)

    if (resetError) {
      setError(resetError.message || 'Could not send reset link. Please try again.')
      return
    }

    setMessage('Password reset link sent to your email')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Reset Password</h3>

        {message ? (
          <>
            <p className="text-sm text-green-600">{message}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <label htmlFor="resetEmail" className="mb-1 block text-sm font-medium text-gray-700">
              Enter your email
            </label>
            <input
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {sending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSend}
                    className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:flex-1"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 sm:flex-1"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal
