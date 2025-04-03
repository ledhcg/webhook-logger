"use client";

import { WebhookLog } from "@/lib/supabase";

interface LogModalProps {
  log: WebhookLog | null;
  onClose: () => void;
}

export default function LogModal({ log, onClose }: LogModalProps) {
  if (!log) {
    return null;
  }

  const getMethodColor = (method?: string) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "bg-green-50 text-green-700 border-green-200";
      case "POST":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PUT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border-red-200";
      case "PATCH":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "bg-slate-50 text-slate-600";
    if (status >= 500) return "bg-red-50 text-red-700";
    if (status >= 400) return "bg-orange-50 text-orange-700";
    if (status >= 300) return "bg-blue-50 text-blue-700";
    if (status >= 200) return "bg-green-50 text-green-700";
    return "bg-slate-50 text-slate-700";
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto modal-overlay"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-slate-600 bg-opacity-50 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-slate-200 modal-content">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3
              className="text-lg leading-6 font-semibold text-slate-800 flex items-center"
              id="modal-title"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Webhook Request Details
            </h3>
            <button
              type="button"
              className="text-slate-500 hover:text-slate-700 focus:outline-none"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="bg-white px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase">
                      Method
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex font-mono text-sm font-semibold px-2.5 py-1 rounded-md border ${getMethodColor(
                          log.method
                        )}`}
                      >
                        {log.method?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                  {log.status_code && (
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase">
                        Status
                      </span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex text-sm font-semibold px-2.5 py-1 rounded-md ${getStatusColor(
                            log.status_code
                          )}`}
                        >
                          {log.status_code}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Timestamp
                </span>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Path
                </span>
                <p className="mt-1 text-sm font-medium text-slate-800 break-all">
                  {log.path || "/"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Headers
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <pre className="bg-white p-3 text-xs font-mono max-h-40 overflow-y-auto">
                    {JSON.stringify(log.headers, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Body
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <pre className="bg-white p-3 text-xs font-mono max-h-60 overflow-y-auto">
                    {JSON.stringify(log.body, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-200">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
