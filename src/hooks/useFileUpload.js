import { useCallback, useState } from 'react'
import * as fileService from '../services/fileService'

function mapFile(file) {
  return {
    id: file.id,
    fileName: file.file_name,
    filePath: file.file_path,
    fileSize: file.file_size,
    fileType: file.file_type,
    sectionName: file.section_name,
    url: fileService.getFileUrl(file.file_path),
  }
}

export function useFileUpload() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const getFormFiles = useCallback(async (formId, sectionName) => {
    try {
      const data = await fileService.getFormFiles(formId, sectionName)
      const mapped = data.map(mapFile)

      if (sectionName) {
        setFiles((prev) => [...prev.filter((file) => file.sectionName !== sectionName), ...mapped])
      } else {
        setFiles(mapped)
      }

      return mapped
    } catch (fetchError) {
      setError(fetchError.message)
      return []
    }
  }, [])

  const uploadFile = useCallback(async (file, formId, sectionName) => {
    setError('')
    setUploading(true)
    setUploadProgress(0)

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev))
    }, 150)

    try {
      const metadata = await fileService.uploadFile(file, formId, sectionName)
      setUploadProgress(100)
      setFiles((prev) => [...prev, metadata])
      return metadata
    } catch (uploadError) {
      setError(uploadError.message)
      return null
    } finally {
      clearInterval(progressTimer)
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const deleteFile = useCallback(async (filePath, sectionName) => {
    setError('')
    try {
      await fileService.deleteFile(filePath)
      setFiles((prev) =>
        prev.filter(
          (file) => !(file.filePath === filePath && (!sectionName || file.sectionName === sectionName))
        )
      )
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }, [])

  const getDownloadUrl = useCallback((filePath) => fileService.getFileUrl(filePath), [])

  const downloadFile = useCallback((filePath, fileName) => {
    const url = fileService.getFileUrl(filePath)
    if (!url) return

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return {
    files,
    uploading,
    uploadProgress,
    error,
    uploadFile,
    deleteFile,
    downloadFile,
    getDownloadUrl,
    getFormFiles,
  }
}
