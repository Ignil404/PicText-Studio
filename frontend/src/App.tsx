import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Editor from "./pages/Editor.tsx";
import Auth from "./pages/Auth.tsx";
import Profile from "./pages/Profile.tsx";
import History from "./pages/History.tsx";
import SharedImage from "./pages/SharedImage.tsx";
import ApiDocs from "./pages/ApiDocs.tsx";
import Webhooks from "./pages/Webhooks.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminTemplates from "./pages/admin/AdminTemplates.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminStats from "./pages/admin/AdminStats.tsx";

const queryClient = new QueryClient();

// Error Boundary for graceful UI failure recovery
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center p-8">
            <p className="text-6xl mb-4">💥</p>
            <p className="text-xl font-bold mb-2">Что-то пошло не так</p>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/editor/:templateId" element={<Editor />} />
              <Route path="/history" element={<History />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/shared/:shareId" element={<SharedImage />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/webhooks" element={<Webhooks />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="templates" element={<AdminTemplates />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="stats" element={<AdminStats />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
