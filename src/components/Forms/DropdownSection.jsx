function DropdownSection({
  selectedSpecialty,
  selectedSurgeon,
  selectedProcedure,
  specialties,
  surgeons,
  procedures,
  onSpecialtySelect,
  onSurgeonSelect,
  onProcedureSelect,
  onAddSpecialty,
  onAddSurgeon,
  onAddProcedure,
  loading,
}) {
  const handleSpecialtyChange = (e) => {
    const specialty = specialties.find((item) => item.id === e.target.value)
    onSpecialtySelect(specialty ?? null)
  }

  const handleSurgeonChange = (e) => {
    const surgeon = surgeons.find((item) => item.id === e.target.value)
    onSurgeonSelect(surgeon ?? null)
  }

  const handleProcedureChange = (e) => {
    const procedure = procedures.find((item) => item.id === e.target.value)
    onProcedureSelect(procedure ?? null)
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="specialty" className="mb-2 block text-sm font-medium text-gray-700">
          Specialty
        </label>
        <select
          id="specialty"
          value={selectedSpecialty?.id ?? ''}
          onChange={handleSpecialtyChange}
          disabled={loading}
          className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select specialty</option>
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddSpecialty}
          className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          + Add New Specialty
        </button>
      </div>

      <div>
        <label
          htmlFor="surgeon"
          className={`mb-2 block text-sm font-medium ${selectedSpecialty ? 'text-gray-700' : 'text-gray-400'}`}
        >
          Surgeon
        </label>
        <select
          id="surgeon"
          value={selectedSurgeon?.id ?? ''}
          onChange={handleSurgeonChange}
          disabled={!selectedSpecialty || loading}
          className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">{selectedSpecialty ? 'Select surgeon' : 'Select a specialty first'}</option>
          {surgeons.map((surgeon) => (
            <option key={surgeon.id} value={surgeon.id}>
              {surgeon.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddSurgeon}
          disabled={!selectedSpecialty}
          className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          + Add New Surgeon
        </button>
      </div>

      <div>
        <label
          htmlFor="procedure"
          className={`mb-2 block text-sm font-medium ${selectedSurgeon ? 'text-gray-700' : 'text-gray-400'}`}
        >
          Procedure
        </label>
        <select
          id="procedure"
          value={selectedProcedure?.id ?? ''}
          onChange={handleProcedureChange}
          disabled={!selectedSurgeon || loading}
          className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">{selectedSurgeon ? 'Select procedure' : 'Select a surgeon first'}</option>
          {procedures.map((procedure) => (
            <option key={procedure.id} value={procedure.id}>
              {procedure.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddProcedure}
          disabled={!selectedSurgeon}
          className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          + Add New Procedure
        </button>
      </div>
    </div>
  )
}

export default DropdownSection
