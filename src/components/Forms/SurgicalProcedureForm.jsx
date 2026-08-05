import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from '../../hooks/useForm'
import { useFileUpload } from '../../hooks/useFileUpload'
import DropdownSection from './DropdownSection'
import AddSpecialtyModal from './AddSpecialtyModal'
import AddSurgeonModal from './AddSurgeonModal'
import AddProcedureModal from './AddProcedureModal'
import FormSection from './FormSection'
import LoadingSpinner from '../Common/LoadingSpinner'

const STANDARD_SECTIONS = [
  { name: 'Surgeon Preference', type: 'textarea' },
  { name: 'Patient Position', type: 'textarea' },
  { name: 'Equipment', type: 'list' },
  { name: 'Instruments', type: 'list' },
  { name: 'Supplies', type: 'list' },
  { name: 'Specimen', type: 'textarea' },
  { name: 'Blood Bank', type: 'text' },
  { name: 'Implant', type: 'text' },
  { name: 'Dressing', type: 'text' },
  { name: 'Post Op Care', type: 'textarea' },
]

const STANDARD_SECTION_NAMES = STANDARD_SECTIONS.map((section) => section.name)

function SurgicalProcedureForm() {
  const navigate = useNavigate()
  const {
    selectedSpecialty,
    selectedSurgeon,
    selectedProcedure,
    specialties,
    surgeons,
    procedures,
    formSections,
    loading,
    error,
    savedAt,
    formId,
    selectSpecialty,
    selectSurgeon,
    selectProcedure,
    addNewSpecialty,
    addNewSurgeon,
    addNewProcedure,
    updateFormSection,
    addCustomSection,
    removeCustomSection,
    saveForm,
  } = useForm()

  const {
    files,
    uploading,
    error: fileError,
    uploadFile,
    deleteFile,
    downloadFile,
    getFormFiles,
  } = useFileUpload()

  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [showSurgeonModal, setShowSurgeonModal] = useState(false)
  const [showProcedureModal, setShowProcedureModal] = useState(false)
  const [showCustomSectionModal, setShowCustomSectionModal] = useState(false)
  const [customSectionName, setCustomSectionName] = useState('')
  const [customSectionError, setCustomSectionError] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingSection, setUploadingSection] = useState(null)
  const dirtySinceMountRef = useRef(false)

  useEffect(() => {
    if (formId) {
      getFormFiles(formId)
    }
  }, [formId, getFormFiles])

  useEffect(() => {
    if (!savedAt) return
    setShowSaved(true)
    const timer = setTimeout(() => setShowSaved(false), 2000)
    return () => clearTimeout(timer)
  }, [savedAt])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirtySinceMountRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const markDirty = () => {
    dirtySinceMountRef.current = true
  }

  const handleSectionChange = (sectionName, value) => {
    markDirty()
    updateFormSection(sectionName, value)
  }

  const handleAddCustomSection = () => {
    const trimmedName = customSectionName.trim()
    if (!trimmedName) {
      setCustomSectionError('Section name is required.')
      return
    }
    if (formSections[trimmedName] !== undefined) {
      setCustomSectionError('A section with this name already exists.')
      return
    }
    markDirty()
    addCustomSection(trimmedName)
    setCustomSectionName('')
    setCustomSectionError('')
    setShowCustomSectionModal(false)
  }

  const handleFileUpload = async (sectionName, file) => {
    setUploadingSection(sectionName)

    let currentFormId = formId
    if (!currentFormId) {
      const result = await saveForm()
      currentFormId = result.formId
    }

    if (currentFormId) {
      await uploadFile(file, currentFormId, sectionName)
    }

    setUploadingSection(null)
  }

  const handleFileDelete = (sectionName, filePath) => {
    deleteFile(filePath, sectionName)
  }

  const handleSubmit = async () => {
    setSaving(true)
    const { error: saveError } = await saveForm()
    setSaving(false)
    if (!saveError) {
      dirtySinceMountRef.current = false
      navigate('/dashboard')
    }
  }

  const handleCancel = () => {
    if (dirtySinceMountRef.current) {
      const confirmed = window.confirm('You have unsaved changes. Leave without saving?')
      if (!confirmed) return
    }
    navigate('/dashboard')
  }

  const customSectionNames = Object.keys(formSections).filter(
    (name) => !STANDARD_SECTION_NAMES.includes(name)
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 sm:text-3xl">
        Create New Surgical Procedure
      </h1>

      <section className="border-b border-gray-200 pb-6">
        <DropdownSection
          selectedSpecialty={selectedSpecialty}
          selectedSurgeon={selectedSurgeon}
          selectedProcedure={selectedProcedure}
          specialties={specialties}
          surgeons={surgeons}
          procedures={procedures}
          onSpecialtySelect={(specialty) => {
            markDirty()
            selectSpecialty(specialty)
          }}
          onSurgeonSelect={(surgeon) => {
            markDirty()
            selectSurgeon(surgeon)
          }}
          onProcedureSelect={(procedure) => {
            markDirty()
            selectProcedure(procedure)
          }}
          onAddSpecialty={() => setShowSpecialtyModal(true)}
          onAddSurgeon={() => setShowSurgeonModal(true)}
          onAddProcedure={() => setShowProcedureModal(true)}
          loading={loading}
        />
      </section>

      <div>
        {STANDARD_SECTIONS.map((section) => (
          <FormSection
            key={section.name}
            title={section.name}
            type={section.type}
            value={formSections[section.name]}
            onChange={(value) => handleSectionChange(section.name, value)}
            files={files.filter((file) => file.sectionName === section.name)}
            onFileUpload={(file) => handleFileUpload(section.name, file)}
            onFileDelete={(filePath) => handleFileDelete(section.name, filePath)}
            onDownload={downloadFile}
            uploading={uploading && uploadingSection === section.name}
          />
        ))}

        {customSectionNames.map((name) => (
          <FormSection
            key={name}
            title={name}
            type="custom"
            value={formSections[name]}
            onChange={(value) => handleSectionChange(name, value)}
            onDelete={() => {
              markDirty()
              removeCustomSection(name)
            }}
            files={files.filter((file) => file.sectionName === name)}
            onFileUpload={(file) => handleFileUpload(name, file)}
            onFileDelete={(filePath) => handleFileDelete(name, filePath)}
            onDownload={downloadFile}
            uploading={uploading && uploadingSection === name}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setCustomSectionName('')
          setCustomSectionError('')
          setShowCustomSectionModal(true)
        }}
        className="mt-4 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        + Add Custom Section
      </button>

      {fileError && <p className="mt-4 text-sm text-red-600">{fileError}</p>}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex flex-col items-start gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          {saving ? (
            <LoadingSpinner />
          ) : (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {showSaved && <span className="font-medium text-green-600">Saved ✓</span>}
          {!showSaved && savedAt && <span>Last saved: {new Date(savedAt).toLocaleTimeString()}</span>}
        </div>
      </div>

      <AddSpecialtyModal
        isOpen={showSpecialtyModal}
        onClose={() => setShowSpecialtyModal(false)}
        onAdd={async (name) => {
          markDirty()
          const specialty = await addNewSpecialty(name)
          if (specialty) selectSpecialty(specialty)
        }}
      />

      <AddSurgeonModal
        isOpen={showSurgeonModal}
        selectedSpecialty={selectedSpecialty}
        onClose={() => setShowSurgeonModal(false)}
        onAdd={async (name) => {
          markDirty()
          const surgeon = await addNewSurgeon(name, selectedSpecialty?.id)
          if (surgeon) selectSurgeon(surgeon)
        }}
      />

      <AddProcedureModal
        isOpen={showProcedureModal}
        selectedSurgeon={selectedSurgeon}
        selectedSpecialty={selectedSpecialty}
        onClose={() => setShowProcedureModal(false)}
        onAdd={async (name) => {
          markDirty()
          const procedure = await addNewProcedure(name, selectedSurgeon?.id, selectedSpecialty?.id)
          if (procedure) selectProcedure(procedure)
        }}
      />

      {showCustomSectionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowCustomSectionModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Custom Section</h3>

            <label htmlFor="customSectionName" className="mb-1 block text-sm font-medium text-gray-700">
              Section Name
            </label>
            <input
              id="customSectionName"
              type="text"
              value={customSectionName}
              onChange={(e) => {
                setCustomSectionName(e.target.value)
                setCustomSectionError('')
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {customSectionError && <p className="mt-1 text-sm text-red-600">{customSectionError}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 sm:flex-1"
              >
                Add Section
              </button>
              <button
                type="button"
                onClick={() => setShowCustomSectionModal(false)}
                className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 sm:flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SurgicalProcedureForm
