import { useEffect, useRef, useState } from 'react'
import LoadingSpinner from '../Common/LoadingSpinner'

function AddProcedureModal({ isOpen, selectedSurgeon, selectedSpecialty, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setError('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAdd = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Procedure name is required.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await onAdd(trimmedName)
      setSaving(false)
      onClose()
    } catch (addError) {
      setSaving(false)
      setError(addError.message || 'Could not add procedure. Please try again.')
    }
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
        <h3 className="mb-1 text-lg font-semibold text-gray-900">Add New Procedure</h3>
        {selectedSurgeon && (
          <p className="mb-4 text-sm text-gray-500">
            For {selectedSurgeon.name}
            {selectedSpecialty?.name ? ` (${selectedSpecialty.name})` : ''}
          </p>
        )}

        <label htmlFor="procedureName" className="mb-1 block text-sm font-medium text-gray-700">
          Procedure Name
        </label>
        <input
          id="procedureName"
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {saving ? (
            <LoadingSpinner />
          ) : (
            <>
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:flex-1"
              >
                Add Procedure
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
      </div>
    </div>
  )
}

export default AddProcedureModal
