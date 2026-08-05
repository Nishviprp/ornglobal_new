import { supabaseClient } from './supabaseClient'

export const MAX_FILE_SIZE = 20 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'pdf',
  'txt',
  'doc',
  'docx',
  'mp3',
  'wav',
  'm4a',
  'aac',
  'ogg',
]

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export async function uploadFile(file, formId, sectionName) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 20MB')
  }

  if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
    throw new Error('Unsupported file type')
  }

  const filePath = `${formId}/${sectionName}/${file.name}`

  const { error: uploadError } = await supabaseClient.storage
    .from('procedures')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    throw new Error(uploadError.message || 'File upload failed')
  }

  const { data: userData } = await supabaseClient.auth.getUser()

  const { data: record, error: insertError } = await supabaseClient
    .from('file_uploads')
    .insert({
      form_id: formId,
      section_name: sectionName,
      uploaded_by: userData?.user?.id ?? null,
      file_name: file.name,
      file_type: file.type,
      file_path: filePath,
      file_size: file.size,
    })
    .select()
    .single()

  if (insertError) {
    throw new Error(insertError.message || 'Could not save file record')
  }

  return {
    id: record.id,
    fileName: file.name,
    filePath,
    fileSize: file.size,
    fileType: file.type,
    sectionName,
    url: getFileUrl(filePath),
  }
}

export async function deleteFile(filePath) {
  const { error: storageError } = await supabaseClient.storage.from('procedures').remove([filePath])

  if (storageError) {
    throw new Error(storageError.message || 'Could not delete file')
  }

  const { error: dbError } = await supabaseClient.from('file_uploads').delete().eq('file_path', filePath)

  if (dbError) {
    throw new Error(dbError.message || 'Could not remove file record')
  }
}

export function getFileUrl(filePath) {
  const { data } = supabaseClient.storage.from('procedures').getPublicUrl(filePath)
  return data?.publicUrl ?? null
}

export async function getFormFiles(formId, sectionName) {
  let query = supabaseClient.from('file_uploads').select('*').eq('form_id', formId)

  if (sectionName) {
    query = query.eq('section_name', sectionName)
  }

  const { data, error } = await query.order('uploaded_at')

  if (error) {
    throw new Error(error.message || 'Could not load files')
  }

  return data ?? []
}
