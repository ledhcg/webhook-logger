import Link from "next/link";

export default function Guide() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header section */}
      <header className="py-12 px-4 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-800 tracking-tight">
            Usage <span className="text-blue-600">Guide</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            How to use webhook logger with different programming languages
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* API Endpoints */}
          <div className="p-6 md:p-8 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Available Endpoints
            </h2>
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
          </div>

          {/* Node.js Example */}
          <div className="p-6 md:p-8 border-b border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.985c-.275 0-.532-.074-.772-.202l-2.439-1.448c-.365-.203-.182-.277-.072-.314.496-.165.588-.201 1.101-.493.056-.037.129-.02.185.017l1.87 1.12c.074.036.166.036.221 0l7.319-4.237c.074-.036.11-.11.11-.202V7.768c0-.091-.036-.165-.11-.201l-7.319-4.219c-.073-.037-.165-.037-.221 0L4.552 7.566c-.073.036-.11.129-.11.201v8.457c0 .073.037.166.11.201l2 1.157c1.082.548 1.762-.095 1.762-.735V8.502c0-.11.091-.221.203-.221h.936c.11 0 .22.092.22.221v8.347c0 1.449-.788 2.294-2.164 2.294-.422 0-.752 0-1.688-.46l-1.925-1.099a1.55 1.55 0 0 1-.771-1.34V7.786c0-.55.293-1.064.771-1.339l7.316-4.237a1.637 1.637 0 0 1 1.544 0l7.317 4.237c.479.274.771.789.771 1.339v8.458c0 .549-.293 1.063-.771 1.34l-7.317 4.236c-.241.11-.516.165-.773.165zm2.256-5.816c-3.21 0-3.88-1.468-3.88-2.714 0-.11.092-.221.204-.221h.954c.11 0 .193.074.211.184.147.971.568 1.449 2.514 1.449 1.54 0 2.202-.35 2.202-1.175 0-.476-.185-.825-2.587-1.063-1.999-.2-3.246-.643-3.246-2.238 0-1.485 1.247-2.366 3.339-2.366 2.347 0 3.503.809 3.649 2.568a.213.213 0 0 1-.055.165.226.226 0 0 1-.161.074h-.954a.211.211 0 0 1-.204-.165c-.22-1.012-.789-1.34-2.275-1.34-1.687 0-1.875.587-1.875 1.03 0 .533.237.696 2.513.99 2.256.293 3.32.715 3.32 2.294-.018 1.615-1.339 2.531-3.669 2.531z" />
              </svg>
              Node.js
            </h2>
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md overflow-x-auto">
              <pre className="text-sm font-mono">
                <code>{`// Using fetch API (Node.js 18+)
const sendWebhook = async () => {
  try {
    const response = await fetch('${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'Custom Value'
      },
      body: JSON.stringify({
        event: 'user.created',
        data: {
          userId: '123',
          email: 'example@example.com'
        }
      })
    });
    
    const data = await response.json();
    console.log('Webhook sent successfully:', data);
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
};

sendWebhook();

// Using axios (for older Node.js versions)
// npm install axios
const axios = require('axios');

axios.post('${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/api/webhook', {
  event: 'user.created',
  data: {
    userId: '123',
    email: 'example@example.com'
  }
}, {
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'Custom Value'
  }
})
.then(response => console.log('Webhook sent successfully:', response.data))
.catch(error => console.error('Error sending webhook:', error));`}</code>
              </pre>
            </div>
          </div>

          {/* Python Example */}
          <div className="p-6 md:p-8 border-b border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14.31.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.83l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.23l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05L0 11.97l.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.24l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05 1.07.13zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22z" />
                <path d="M21.1 6.11l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01.21.03zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08-.33.23z" />
              </svg>
              Python
            </h2>
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md overflow-x-auto">
              <pre className="text-sm font-mono">
                <code>{`# Using requests library
# pip install requests

import requests
import json

url = '${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/api/webhook'
headers = {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'Custom Value'
}
payload = {
    'event': 'user.created',
    'data': {
        'userId': '123',
        'email': 'example@example.com'
    }
}

# POST request
response = requests.post(url, headers=headers, data=json.dumps(payload))
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")

# Other methods
# GET request
# response = requests.get(url, headers=headers)

# PUT request
# response = requests.put(url, headers=headers, data=json.dumps(payload))

# DELETE request
# response = requests.delete(url, headers=headers)

# PATCH request
# response = requests.patch(url, headers=headers, data=json.dumps(payload))`}</code>
              </pre>
            </div>
          </div>

          {/* cURL Example */}
          <div className="p-6 md:p-8 border-b border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
                <path d="M12 9v12" />
                <circle cx="12" cy="3" r="3" />
              </svg>
              cURL
            </h2>
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md overflow-x-auto">
              <pre className="text-sm font-mono">
                <code>{`# POST request
curl -X POST \\
  ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhook \\
  -H 'Content-Type: application/json' \\
  -H 'X-Custom-Header: Custom Value' \\
  -d '{
  "event": "user.created",
  "data": {
    "userId": "123",
    "email": "example@example.com"
  }
}'

# GET request
curl -X GET ${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/api/webhook

# PUT request
curl -X PUT \\
  ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhook \\
  -H 'Content-Type: application/json' \\
  -H 'X-Custom-Header: Custom Value' \\
  -d '{
  "event": "user.updated",
  "data": {
    "userId": "123",
    "email": "updated@example.com"
  }
}'

# DELETE request
curl -X DELETE ${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/api/webhook

# PATCH request
curl -X PATCH \\
  ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhook \\
  -H 'Content-Type: application/json' \\
  -d '{
  "event": "user.partial_update",
  "data": {
    "userId": "123",
    "status": "active"
  }
}'`}</code>
              </pre>
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Tips and Best Practices
            </h2>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>
                    All request data including headers, query parameters, and
                    body will be logged.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>
                    Custom headers can be used to include additional information
                    with your webhooks.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>
                    Webhook logs are automatically deleted after 7 days of
                    inactivity.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>
                    For testing error handling, you can add a{" "}
                    <code className="bg-white px-1 py-0.5 rounded text-red-600">
                      ?error=true
                    </code>{" "}
                    query parameter to simulate failures.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
