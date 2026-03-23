export default function RetryButton({ onClick, label = 'Retry', small = false }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border border-[#C97B84] bg-[#F5E0E3] text-[#C97B84] hover:bg-[#C97B84]/20 transition-colors cursor-pointer ${
        small ? 'text-xs px-2 py-1' : 'text-sm px-4 py-2'
      }`}
    >
      <svg className={small ? 'w-3 h-3' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {label}
    </button>
  );
}
