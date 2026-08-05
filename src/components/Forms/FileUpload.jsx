import { useRef, useState } from 'react'

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
const MAX_FILE_SIZE = 20 * 1024 * 1024

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function formatFileSize(bytes) {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(mb < 10 ? 2 : 0)} MB`
}

function FileUpload({ files, onFileUpload, onFileDelete, onDownload, uploading, uploadProgress }) {
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 20MB'
    }
    if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
      return 'Unsupported file type'
    }
    return null
  }

  const handleFiles = (fileList) => {
    setLocalError('')
    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        setLocalError(`${file.name}: ${validationError}`)
        return
      }
      onFileUpload(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleBrowseChange = (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files)
    }
    e.target.value = ''
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-gray-700">Drag files here or click to browse</p>
        <p className="mt-1 text-sm text-gray-500">Supported: Images, Videos, PDFs, Voice (Max 20MB)</p>
        <input ref={inputRef} type="file" multiple onChange={handleBrowseChange} className="hidden" />
      </div>

      {localError && <p className="mt-2 text-sm text-red-600">{localError}</p>}

      {uploading && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li
              key={file.id ?? file.filePath}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{file.fileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onDownload(file.filePath, file.fileName)}
                  className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => onFileDelete(file.filePath, file.id)}
                  className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileUpload
