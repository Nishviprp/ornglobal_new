import { supabaseClient } from './supabaseClient'

export async function getSpecialties() {
  const { data, error } = await supabaseClient
    .from('surgical_specialties')
    .select('*')
    .order('name')
  return { data: data ?? [], error }
}

export async function addSpecialty(name) {
  const { data, error } = await supabaseClient
    .from('surgical_specialties')
    .insert({ name })
    .select()
    .single()
  return { data, error }
}

export async function getSurgeonsBySpecialty(specialtyId) {
  const { data, error } = await supabaseClient
    .from('surgeons')
    .select('*')
    .eq('specialty_id', specialtyId)
    .order('name')
  return { data: data ?? [], error }
}

export async function addSurgeon(name, specialtyId) {
  const { data, error } = await supabaseClient
    .from('surgeons')
    .insert({ name, specialty_id: specialtyId })
    .select()
    .single()
  return { data, error }
}

export async function getProceduresBySurgeon(surgeonId) {
  const { data, error } = await supabaseClient
    .from('procedures')
    .select('*')
    .eq('surgeon_id', surgeonId)
    .order('name')
  return { data: data ?? [], error }
}

export async function addProcedure(name, surgeonId, specialtyId) {
  const { data, error } = await supabaseClient
    .from('procedures')
    .insert({ name, surgeon_id: surgeonId, specialty_id: specialtyId })
    .select()
    .single()
  return { data, error }
}

export async function createForm(formData, hospitalId) {
  if (!hospitalId) {
    return { data: null, error: { message: 'hospital_id is required to create a form.' } }
  }

  const { data, error } = await supabaseClient
    .from('surgical_procedure_forms')
    .insert({ ...formData, hospital_id: hospitalId })
    .select()
    .single()
  return { data, error }
}

export async function updateForm(formId, formData) {
  const { data, error } = await supabaseClient
    .from('surgical_procedure_forms')
    .update(formData)
    .eq('id', formId)
    .select()
    .single()
  return { data, error }
}

export async function getForm(formId) {
  const { data, error } = await supabaseClient
    .from('surgical_procedure_forms')
    .select('*')
    .eq('id', formId)
    .single()
  return { data, error }
}

export async function deleteForm(formId) {
  const { error } = await supabaseClient.from('surgical_procedure_forms').delete().eq('id', formId)
  return { error }
}

export async function addFormSection(formId, sectionName, sectionData) {
  const { data, error } = await supabaseClient
    .from('form_sections')
    .insert({ form_id: formId, section_name: sectionName, section_data: sectionData })
    .select()
    .single()
  return { data, error }
}

export async function updateFormSection(formId, sectionName, sectionData) {
  const { data: existing, error: fetchError } = await supabaseClient
    .from('form_sections')
    .select('id')
    .eq('form_id', formId)
    .eq('section_name', sectionName)
    .maybeSingle()

  if (fetchError) {
    return { data: null, error: fetchError }
  }

  if (existing) {
    const { data, error } = await supabaseClient
      .from('form_sections')
      .update({ section_data: sectionData })
      .eq('id', existing.id)
      .select()
      .single()
    return { data, error }
  }

  return addFormSection(formId, sectionName, sectionData)
}

export async function getFormSections(formId) {
  const { data, error } = await supabaseClient.from('form_sections').select('*').eq('form_id', formId)
  return { data: data ?? [], error }
}
