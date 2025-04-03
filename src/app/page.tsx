import LogsDisplayWrapper from "../components/LogsDisplayWrapper";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header and hero section */}
      <header className="py-12 px-4 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-800 tracking-tight">
            Webhook <span className="text-blue-600">Logger</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Receive, inspect and debug webhook requests from any service
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Instructions section */}
          <div className="p-6 md:p-8 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              How to use
            </h2>
            <div className="text-slate-700 space-y-3">
              <p>
                Send webhooks to this server using any of the following
                endpoints:
              </p>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm overflow-auto">
                <code className="block font-mono text-sm mb-2">
                  <span className="text-green-600 font-semibold">GET</span>{" "}
                  /api/webhook
                </code>
                <code className="block font-mono text-sm mb-2">
                  <span className="text-blue-600 font-semibold">POST</span>{" "}
                  /api/webhook
                </code>
                <code className="block font-mono text-sm mb-2">
                  <span className="text-orange-600 font-semibold">PUT</span>{" "}
                  /api/webhook
                </code>
                <code className="block font-mono text-sm mb-2">
                  <span className="text-red-600 font-semibold">DELETE</span>{" "}
                  /api/webhook
                </code>
                <code className="block font-mono text-sm">
                  <span className="text-purple-600 font-semibold">PATCH</span>{" "}
                  /api/webhook
                </code>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                All requests, headers, and payloads will be logged and displayed
                below in real-time.
              </p>
            </div>
          </div>

          {/* Logs section */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Recent Webhook Logs
            </h2>
            <LogsDisplayWrapper />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>
            Webhook logs are automatically deleted after 7 days of inactivity
          </p>
        </footer>
      </div>
    </main>
  );
}
