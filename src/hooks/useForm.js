import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'
import { supabaseClient } from '../services/supabaseClient'
import * as formService from '../services/formService'

const AUTO_SAVE_INTERVAL = 30000

const DEFAULT_SECTIONS = {
  'Surgeon Preference': '',
  'Patient Position': '',
  Equipment: [],
  Instruments: [],
  Supplies: [],
  Specimen: '',
  'Blood Bank': '',
  Implant: '',
  Dressing: '',
  'Post Op Care': '',
}

export function useForm(initialFormId = null) {
  const { user } = useAuth()

  const [selectedSpecialty, setSelectedSpecialty] = useState(null)
  const [selectedSurgeon, setSelectedSurgeon] = useState(null)
  const [selectedProcedure, setSelectedProcedure] = useState(null)

  const [specialties, setSpecialties] = useState([])
  const [surgeons, setSurgeons] = useState([])
  const [procedures, setProcedures] = useState([])

  const [formSections, setFormSections] = useState(DEFAULT_SECTIONS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [formId, setFormId] = useState(initialFormId)

  const [hospitalId, setHospitalId] = useState(null)
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)

  const fetchSpecialties = useCallback(async () => {
    const { data, error: fetchError } = await formService.getSpecialties()
    if (fetchError) {
      setError(fetchError.message)
      return
    }
    setSpecialties(data)
  }, [])

  const fetchSurgeonsBySpecialty = useCallback(async (specialtyId) => {
    if (!specialtyId) {
      setSurgeons([])
      return []
    }
    const { data, error: fetchError } = await formService.getSurgeonsBySpecialty(specialtyId)
    if (fetchError) {
      setError(fetchError.message)
      return []
    }
    setSurgeons(data)
    return data
  }, [])

  const fetchProceduresBySurgeon = useCallback(async (surgeonId) => {
    if (!surgeonId) {
      setProcedures([])
      return []
    }
    const { data, error: fetchError } = await formService.getProceduresBySurgeon(surgeonId)
    if (fetchError) {
      setError(fetchError.message)
      return []
    }
    setProcedures(data)
    return data
  }, [])

  useEffect(() => {
    fetchSpecialties()
  }, [fetchSpecialties])

  useEffect(() => {
    if (!user?.id) return
    let active = true

    async function fetchHospitalId() {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser()
      if (!active) return

      if (userError || !userData?.user) {
        setError(userError?.message || 'Could not verify the current user.')
        return
      }

      const { data, error: hospitalError } = await supabaseClient
        .from('users')
        .select('hospital_id')
        .eq('id', userData.user.id)
        .maybeSingle()

      if (!active) return

      if (hospitalError) {
        setError(hospitalError.message || 'Could not load your hospital information.')
        return
      }

      setHospitalId(data?.hospital_id ?? null)
    }

    fetchHospitalId()

    return () => {
      active = false
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedSpecialty?.id && !selectedSpecialty.name) {
      const match = specialties.find((specialty) => specialty.id === selectedSpecialty.id)
      if (match) setSelectedSpecialty(match)
    }
  }, [specialties, selectedSpecialty])

  useEffect(() => {
    if (!initialFormId) return
    let active = true
    setLoading(true)

    async function loadForm() {
      const { data: form, error: formError } = await formService.getForm(initialFormId)
      if (!active) return

      if (formError || !form) {
        setError(formError?.message || 'Could not load this form.')
        setLoading(false)
        return
      }

      setFormId(form.id)
      setSavedAt(form.updated_at)

      if (form.specialty_id) {
        setSelectedSpecialty({ id: form.specialty_id })
        const surgeonList = await fetchSurgeonsBySpecialty(form.specialty_id)
        if (!active) return

        if (form.surgeon_id) {
          const matchedSurgeon = surgeonList.find((surgeon) => surgeon.id === form.surgeon_id)
          setSelectedSurgeon(matchedSurgeon ?? { id: form.surgeon_id })

          const procedureList = await fetchProceduresBySurgeon(form.surgeon_id)
          if (!active) return

          if (form.procedure_id) {
            const matchedProcedure = procedureList.find(
              (procedure) => procedure.id === form.procedure_id
            )
            setSelectedProcedure(matchedProcedure ?? { id: form.procedure_id })
          }
        }
      }

      const { data: sections } = await formService.getFormSections(form.id)
      if (active && sections?.length) {
        setFormSections((prev) => {
          const next = { ...prev }
          sections.forEach((section) => {
            next[section.section_name] = section.section_data
          })
          return next
        })
      }

      setLoading(false)
    }

    loadForm()
    return () => {
      active = false
    }
  }, [initialFormId, fetchSurgeonsBySpecialty, fetchProceduresBySurgeon])

  const selectSpecialty = useCallback(
    (specialty) => {
      setSelectedSpecialty(specialty)
      setSelectedSurgeon(null)
      setSelectedProcedure(null)
      setProcedures([])
      dirtyRef.current = true
      fetchSurgeonsBySpecialty(specialty?.id)
    },
    [fetchSurgeonsBySpecialty]
  )

  const selectSurgeon = useCallback(
    (surgeon) => {
      setSelectedSurgeon(surgeon)
      setSelectedProcedure(null)
      dirtyRef.current = true
      fetchProceduresBySurgeon(surgeon?.id)
    },
    [fetchProceduresBySurgeon]
  )

  const selectProcedure = useCallback((procedure) => {
    setSelectedProcedure(procedure)
    dirtyRef.current = true
  }, [])

  const addNewSpecialty = useCallback(async (name) => {
    const { data, error: addError } = await formService.addSpecialty(name)
    if (addError) {
      const message = addError.message || 'Could not add specialty.'
      setError(message)
      throw new Error(message)
    }
    setSpecialties((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }, [])

  const addNewSurgeon = useCallback(async (name, specialtyId) => {
    const { data, error: addError } = await formService.addSurgeon(name, specialtyId)
    if (addError) {
      const message = addError.message || 'Could not add surgeon.'
      setError(message)
      throw new Error(message)
    }
    setSurgeons((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }, [])

  const addNewProcedure = useCallback(async (name, surgeonId, specialtyId) => {
    const { data, error: addError } = await formService.addProcedure(name, surgeonId, specialtyId)
    if (addError) {
      const message = addError.message || 'Could not add procedure.'
      setError(message)
      throw new Error(message)
    }
    setProcedures((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }, [])

  const updateFormSection = useCallback((sectionName, sectionData) => {
    dirtyRef.current = true
    setFormSections((prev) => ({ ...prev, [sectionName]: sectionData }))
  }, [])

  const addCustomSection = useCallback((sectionName) => {
    dirtyRef.current = true
    setFormSections((prev) => {
      if (prev[sectionName] !== undefined) return prev
      return { ...prev, [sectionName]: [] }
    })
  }, [])

  const removeCustomSection = useCallback((sectionName) => {
    dirtyRef.current = true
    setFormSections((prev) => {
      const next = { ...prev }
      delete next[sectionName]
      return next
    })
  }, [])

  const saveForm = useCallback(async () => {
    if (savingRef.current) return { formId, error: null }

    if (!formId && !hospitalId) {
      const message = 'Still loading your hospital information. Please try again in a moment.'
      setError(message)
      return { formId, error: { message } }
    }

    savingRef.current = true
    setLoading(true)
    setError('')

    const payload = {
      specialty_id: selectedSpecialty?.id ?? null,
      surgeon_id: selectedSurgeon?.id ?? null,
      procedure_id: selectedProcedure?.id ?? null,
      user_id: user?.id ?? null,
      created_by: user?.id ?? null,
      status: 'draft',
    }

    let currentFormId = formId
    let saveError = null

    if (currentFormId) {
      const { error: updateError } = await formService.updateForm(currentFormId, payload)
      saveError = updateError
    } else {
      const { data, error: createError } = await formService.createForm(payload, hospitalId)
      saveError = createError
      if (data) {
        currentFormId = data.id
        setFormId(data.id)
      }
    }

    if (saveError) {
      setError(saveError.message || 'Could not save form. Please try again.')
      setLoading(false)
      savingRef.current = false
      return { formId: currentFormId, error: saveError }
    }

    await Promise.all(
      Object.entries(formSections).map(([sectionName, sectionData]) =>
        formService.updateFormSection(currentFormId, sectionName, sectionData)
      )
    )

    dirtyRef.current = false
    setSavedAt(new Date().toISOString())
    setLoading(false)
    savingRef.current = false

    return { formId: currentFormId, error: null }
  }, [formId, hospitalId, selectedSpecialty, selectedSurgeon, selectedProcedure, formSections, user?.id])

  const autoSave = useCallback(() => {
    if (!dirtyRef.current) return
    saveForm()
  }, [saveForm])

  const saveFormRef = useRef(saveForm)
  useEffect(() => {
    saveFormRef.current = saveForm
  }, [saveForm])

  useEffect(() => {
    const timer = setInterval(() => {
      if (dirtyRef.current) {
        saveFormRef.current()
      }
    }, AUTO_SAVE_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return {
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
    hospitalId,
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
    autoSave,
  }
}
