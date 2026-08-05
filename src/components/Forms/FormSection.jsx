import { useRef, useState } from 'react'

function formatFileSize(bytes) {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(mb < 10 ? 2 : 0)} MB`
}

function FormSection({
  title,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  description = '',
  editable = true,
  onDelete,
  files = [],
  onFileUpload,
  onFileDelete,
  onDownload,
  uploading = false,
}) {
  const [newItem, setNewItem] = useState('')
  const fileInputRef = useRef(null)

  const isListType = type === 'list' || type === 'custom'
  const items = isListType && Array.isArray(value) ? value : []

  const handleAddItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setNewItem('')
  }

  const handleRemoveItem = (index) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onFileUpload?.(file)
    e.target.value = ''
  }

  return (
    <div className="border-b border-gray-200 py-6">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{title}</label>
        {type === 'custom' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
          >
            Delete section
          </button>
        )}
      </div>

      {description && <p className="mb-2 text-sm text-gray-500">{description}</p>}

      {type === 'text' && (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={!editable}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={!editable}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      )}

      {isListType && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
            >
              <span className="text-sm text-gray-800">{item}</span>
              {editable && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  aria-label={`Remove ${item}`}
                  className="cursor-pointer text-gray-500 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {editable && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || `Add ${title.toLowerCase()}`}
                className="w-full flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {onFileUpload && (
        <div className="mt-4">
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file) => (
                <li
                  key={file.id ?? file.filePath}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-800">{file.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onDownload?.(file.filePath, file.fileName)}
                      className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => onFileDelete?.(file.filePath)}
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
      )}
    </div>
  )
}

export default FormSection
