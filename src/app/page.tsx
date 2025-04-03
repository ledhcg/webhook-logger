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
import { MessageSquare, Info, AlertTriangle } from "lucide-react";

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
                  <MessageSquare className="w-5 h-5 text-blue-600" />
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
                  <Info className="w-5 h-5 text-blue-600" />
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
                </div>
              </CardContent>
              <CardFooter>
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
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
