import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Square, Cpu } from "lucide-react";

export default function Guide() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header section */}
      <header className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Usage Guide</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-800 tracking-tight">
              Usage <span className="text-blue-600">Guide</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              How to use webhook logger with different programming languages
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <Badge className="w-16 justify-center mr-4">POST</Badge>
              <code className="font-mono text-sm">/api/webhook</code>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="nodejs" className="mb-8">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
          </TabsList>

          {/* Node.js Example */}
          <TabsContent value="nodejs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-green-600" />
                  Node.js Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 rounded-md border">
                  <div className="p-4 text-sm bg-gray-900 text-white font-mono">
                    <pre className="whitespace-pre-wrap">{`// Using fetch API (Node.js 18+)
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
.catch(error => console.error('Error sending webhook:', error));`}</pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Python Example */}
          <TabsContent value="python" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Python Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 rounded-md border">
                  <div className="p-4 text-sm bg-gray-900 text-white font-mono">
                    <pre className="whitespace-pre-wrap">{`# Using requests library
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
print(f"Response: {response.json()}")`}</pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* cURL Example */}
          <TabsContent value="curl" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-600" />
                  cURL Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 rounded-md border">
                  <div className="p-4 text-sm bg-gray-900 text-white font-mono">
                    <pre className="whitespace-pre-wrap">{`# Basic POST request
curl -X POST ${
                      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                    }/api/webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Custom-Header: Custom Value" \\
  -d '{
    "event": "user.created",
    "data": {
      "userId": "123",
      "email": "example@example.com"
    }
  }'`}</pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="text-center">
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
