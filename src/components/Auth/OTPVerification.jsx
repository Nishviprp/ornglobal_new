import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { resendOTP } from '../../services/authService'
import LoadingSpinner from '../Common/LoadingSpinner'

function OTPVerification({ email }) {
  const { verifyOTP } = useAuth()
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))
    setError('')
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (otp.length !== 8) {
      setError('Please enter the 8-digit code sent to your email.')
      return
    }

    setLoading(true)
    const { error: verifyError } = await verifyOTP(email, otp)
    setLoading(false)

    if (verifyError) {
      setError(verifyError.message || 'Invalid or expired code. Please try again.')
      return
    }

    navigate('/dashboard', { replace: true })
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setResending(true)
    const { error: resendError } = await resendOTP(email)
    setResending(false)

    if (resendError) {
      setError(resendError.message || 'Could not resend code. Please try again.')
    } else {
      setMessage('A new code has been sent to your email.')
    }
  }

  return (
    <div className="w-full">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Verify your email</h2>
      <p className="mb-6 text-sm text-gray-600">
        Enter the 8-digit code we sent to <span className="font-medium">{email}</span>.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={handleChange}
            placeholder="12345678"
            maxLength={8}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Verify
          </button>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {resending ? 'Resending...' : 'Resend code'}
        </button>
      </form>
    </div>
  )
}

export default OTPVerification
