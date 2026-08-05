import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseClient } from '../../services/supabaseClient'
import LoadingSpinner from '../Common/LoadingSpinner'
import OTPVerification from './OTPVerification'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Signup() {
  const { signup } = useAuth()
  const [hospitals, setHospitals] = useState([])
  const [hospitalsLoading, setHospitalsLoading] = useState(true)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospitalId: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signedUpEmail, setSignedUpEmail] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false)
  const [newHospitalName, setNewHospitalName] = useState('')
  const [newHospitalError, setNewHospitalError] = useState('')
  const [addingHospital, setAddingHospital] = useState(false)
  const [hospitalSuccessMessage, setHospitalSuccessMessage] = useState('')

  useEffect(() => {
    let active = true

    async function fetchHospitals() {
      const { data, error } = await supabaseClient.from('hospitals').select('id, name').order('name')
      if (active) {
        if (!error && data) setHospitals(data)
        setHospitalsLoading(false)
      }
    }

    fetchHospitals()
    return () => {
      active = false
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
  }

  const validate = () => {
    const next = {}

    if (!form.firstName.trim()) next.firstName = 'First name is required.'
    if (!form.lastName.trim()) next.lastName = 'Last name is required.'
    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!EMAIL_REGEX.test(form.email)) {
      next.email = 'Enter a valid email address.'
    }
    if (!form.password) {
      next.password = 'Password is required.'
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters.'
    }
    if (!form.confirmPassword) {
      next.confirmPassword = 'Please confirm your password.'
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match.'
    }
    if (!form.hospitalId) next.hospitalId = 'Please select a hospital.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleOpenAddHospital = () => {
    setNewHospitalName('')
    setNewHospitalError('')
    setShowAddHospitalModal(true)
  }

  const handleCancelAddHospital = () => {
    setShowAddHospitalModal(false)
    setNewHospitalName('')
    setNewHospitalError('')
  }

  const handleAddHospital = async () => {
    const trimmedName = newHospitalName.trim()

    if (!trimmedName) {
      setNewHospitalError('Hospital name is required.')
      return
    }

    setNewHospitalError('')
    setAddingHospital(true)
    const { data, error } = await supabaseClient
      .from('hospitals')
      .insert({ name: trimmedName })
      .select('id, name')
      .single()
    setAddingHospital(false)

    if (error) {
      setNewHospitalError(error.message || 'Could not add hospital. Please try again.')
      return
    }

    setHospitals((prev) =>
      [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
    )
    setForm((prev) => ({ ...prev, hospitalId: data.id }))
    setErrors((prev) => ({ ...prev, hospitalId: '' }))
    setShowAddHospitalModal(false)
    setNewHospitalName('')
    setHospitalSuccessMessage('Hospital added successfully')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setLoading(true)
    const { error } = await signup(
      form.email.trim(),
      form.firstName.trim(),
      form.lastName.trim(),
      form.password,
      form.hospitalId
    )
    setLoading(false)

    if (error) {
      setSubmitError(error.message || 'Could not create your account. Please try again.')
      return
    }

    setSignedUpEmail(form.email.trim())
  }

  if (signedUpEmail) {
    return <OTPVerification email={signedUpEmail} />
  }

  return (
    <div className="w-full">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Create your account</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="hospitalId" className="mb-1 block text-sm font-medium text-gray-700">
            Hospital
          </label>
          <select
            id="hospitalId"
            name="hospitalId"
            value={form.hospitalId}
            onChange={handleChange}
            disabled={hospitalsLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{hospitalsLoading ? 'Loading hospitals...' : 'Select a hospital'}</option>
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>
          {errors.hospitalId && <p className="mt-1 text-sm text-red-600">{errors.hospitalId}</p>}
          <button
            type="button"
            onClick={handleOpenAddHospital}
            className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Add New Hospital
          </button>
          {hospitalSuccessMessage && (
            <p className="mt-1 text-sm text-green-600">{hospitalSuccessMessage}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={`absolute inset-y-0 right-3 flex cursor-pointer items-center text-gray-500 ${showPassword ? 'opacity-100' : 'opacity-50'}`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className={`absolute inset-y-0 right-3 flex cursor-pointer items-center text-gray-500 ${showConfirmPassword ? 'opacity-100' : 'opacity-50'}`}
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
            Sign up
          </button>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Login
        </Link>
      </p>

      {showAddHospitalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleCancelAddHospital}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add New Hospital</h3>

            <label htmlFor="newHospitalName" className="mb-1 block text-sm font-medium text-gray-700">
              Hospital Name
            </label>
            <input
              id="newHospitalName"
              type="text"
              value={newHospitalName}
              onChange={(e) => {
                setNewHospitalName(e.target.value)
                setNewHospitalError('')
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {newHospitalError && <p className="mt-1 text-sm text-red-600">{newHospitalError}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {addingHospital ? (
                <LoadingSpinner />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddHospital}
                    className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:flex-1"
                  >
                    Add Hospital
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddHospital}
                    className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 sm:flex-1"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Signup
