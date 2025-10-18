export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="inline-flex items-center gap-3 text-gray-600">
        <svg
          className="h-8 w-8 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-sm">Loading…</span>
      </span>
    </div>
  )
}
