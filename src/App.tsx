import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import LandingPage from "@/components/landing/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AccountsPage from "@/pages/AccountsPage";
import AccountDetailPage from "@/pages/AccountDetailPage";
import CampaignsPage from "@/pages/CampaignsPage";
import NotFound from "@/pages/NotFound";
import UserSettingsPage from "./pages/UserSettingsPage";

import ForgotPasswordPage from "@/pages/ForgotPasswordPage"; 

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Ahora el mismo componente maneja ambas rutas de recuperación */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute />}>
              {/* Protected routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/accounts" element={<AccountsPage />} />
              <Route path="/dashboard/accounts/:accountId" element={<AccountDetailPage />} />
              <Route path="/dashboard/campaigns" element={<CampaignsPage />} />
              <Route path="/dashboard/settings" element={<UserSettingsPage />} />
            </Route>

            {/* Fallback Routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
