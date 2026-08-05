function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 sm:h-12 sm:w-12" />
      <p className="text-sm text-gray-500 sm:text-base">Loading...</p>
    </div>
  )
}

export default LoadingSpinner
