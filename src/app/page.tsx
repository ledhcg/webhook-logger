import LogsDisplayWrapper from "../components/LogsDisplayWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header with breadcrumb */}
      <header className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-slate-800 tracking-tight">
              Webhook <span className="text-blue-600">Logger</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Receive, inspect and debug webhook requests from any service
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <Tabs defaultValue="dashboard" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                </CardTitle>
                <CardDescription>
                  View and inspect your recent webhook requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogsDisplayWrapper />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                  Available Endpoints
                </CardTitle>
                <CardDescription>
                  Send webhooks to these endpoints to log requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex items-center">
                    <span className="inline-block w-16 text-blue-600 font-semibold">
                      POST
                    </span>
                    <span>/api/webhook</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-16 text-green-600 font-semibold">
                      GET
                    </span>
                    <span>/api/webhook</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-16 text-orange-600 font-semibold">
                      PUT
                    </span>
                    <span>/api/webhook</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-16 text-red-600 font-semibold">
                      DELETE
                    </span>
                    <span>/api/webhook</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-16 text-purple-600 font-semibold">
                      PATCH
                    </span>
                    <span>/api/webhook</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <AlertTitle>Need more examples?</AlertTitle>
                  <AlertDescription>
                    Check out our detailed integration guide for more examples
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
            <div className="flex justify-center mt-6">
              <Button asChild>
                <Link href="/guide">View Complete Usage Guide</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Separator className="my-6" />
        <footer className="text-center text-sm text-slate-500">
          <p>
            Webhook logs are automatically deleted after 7 days of inactivity
          </p>
        </footer>
      </div>
    </main>
  );
}
