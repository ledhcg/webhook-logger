import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeBlock } from "@/components/ui/code-block";
import { Cpu, Square } from "lucide-react";

interface CodeExamplesProps {
  selectedToken: string;
}

export default function CodeExamples({ selectedToken }: CodeExamplesProps) {
  const [nodejsLanguage, setNodejsLanguage] = useState<
    "javascript" | "typescript"
  >("javascript");

  return (
    <Tabs defaultValue="nodejs" className="m-6 mb-2 mt-2">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="nodejs">Node.js</TabsTrigger>
        <TabsTrigger value="python">Python</TabsTrigger>
        <TabsTrigger value="curl">cURL</TabsTrigger>
      </TabsList>

      {/* Node.js Example */}
      <TabsContent value="nodejs" className="mt-6">
        <ScrollArea className="h-80 rounded-md border">
          {nodejsLanguage === "javascript" ? (
            <CodeBlock
              code={`// Using fetch API (Node.js 18+)
const sendWebhook = async () => {
  try {
    const response = await fetch('${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Token': '${selectedToken}',
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
    'X-Webhook-Token': '${selectedToken}',
    'X-Custom-Header': 'Custom Value'
  }
})
.then(response => console.log('Webhook sent successfully:', response.data))
.catch(error => console.error('Error sending webhook:', error));`}
              language="javascript"
              showLanguage={true}
              filename="node_example.js"
              enableLanguageSwitcher={true}
              availableLanguages={["javascript", "typescript"]}
              onLanguageChange={(lang) => {
                setNodejsLanguage(lang as "javascript" | "typescript");
              }}
            />
          ) : (
            <CodeBlock
              code={`// Using fetch API (Node.js 18+ with TypeScript)
interface WebhookData {
  event: string;
  data: {
    userId: string;
    email: string;
  };
}

interface WebhookResponse {
  success: boolean;
  message: string;
}

const sendWebhook = async (): Promise<void> => {
  try {
    const response = await fetch('${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Token': '${selectedToken}',
        'X-Custom-Header': 'Custom Value'
      },
      body: JSON.stringify({
        event: 'user.created',
        data: {
          userId: '123',
          email: 'example@example.com'
        }
      } as WebhookData)
    });
    
    const data = await response.json() as WebhookResponse;
    console.log('Webhook sent successfully:', data);
  } catch (error: unknown) {
    console.error('Error sending webhook:', error instanceof Error ? error.message : String(error));
  }
};

sendWebhook();

// Using axios with TypeScript
// npm install axios @types/axios
import axios from 'axios';

axios.post<WebhookResponse>('${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/api/webhook', {
  event: 'user.created',
  data: {
    userId: '123',
    email: 'example@example.com'
  }
} as WebhookData, {
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Token': '${selectedToken}',
    'X-Custom-Header': 'Custom Value'
  }
})
.then(response => console.log('Webhook sent successfully:', response.data))
.catch((error: unknown) => console.error('Error sending webhook:', error));`}
              language="typescript"
              showLanguage={true}
              filename="node_example.ts"
              enableLanguageSwitcher={true}
              availableLanguages={["javascript", "typescript"]}
              onLanguageChange={(lang) => {
                setNodejsLanguage(lang as "javascript" | "typescript");
              }}
            />
          )}
        </ScrollArea>
      </TabsContent>

      {/* Python Example */}
      <TabsContent value="python" className="mt-6">
        <ScrollArea className="h-80 rounded-md border">
          <CodeBlock
            code={`# Using requests library
# pip install requests

import requests
import json

url = '${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/api/webhook'
headers = {
    'Content-Type': 'application/json',
    'X-Webhook-Token': '${selectedToken}',
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
print(f"Response: {response.json()}")`}
            language="python"
            showLanguage={true}
            filename="python_example.py"
          />
        </ScrollArea>
      </TabsContent>

      {/* cURL Example */}
      <TabsContent value="curl" className="mt-6">
        <ScrollArea className="h-80 rounded-md border">
          <CodeBlock
            code={`# Basic POST request
curl -X POST ${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/api/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Token: ${selectedToken}" \\
  -H "X-Custom-Header: Custom Value" \\
  -d '{
    "event": "user.created",
    "data": {
      "userId": "123",
      "email": "example@example.com"
    }
  }'`}
            language="bash"
            showLanguage={true}
            filename="curl_example.sh"
          />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
