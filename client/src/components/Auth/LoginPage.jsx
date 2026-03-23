export default function LoginPage({ API }) {
  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-white tracking-tight">Calendar Assistant</h1>
      <p className="text-gray-400 text-sm">Connect your Google Calendar to get started</p>
      <a
        href={`${API}/auth/google`}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
      >
        Connect Google Calendar
      </a>
    </div>
  );
}
