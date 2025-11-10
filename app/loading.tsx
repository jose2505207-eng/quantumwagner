export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>

        <p className="text-sm text-gray-400">Loading, please wait...</p>
      </div>
    </div>
  );
}
