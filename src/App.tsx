import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import OnboardingPage from "./pages/Onboarding";
import HomePage from "./pages/Home";
import BrowseCategoryPage from "./pages/BrowseCategory";
import BookDetailsPage from "./pages/BookDetails";
import AddBookPage from "./pages/AddBook";
import MyListingsPage from "./pages/MyListings";
import ProfilePage from "./pages/Profile";
import NilkhetPage from "./pages/Nilkhet";
import NilkhetBookDetailsPage from "./pages/NilkhetBookDetails";
import BookDemandPage from "./pages/BookDemand";
import MyOrdersPage from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import DepartmentRequestsPage from "./pages/DepartmentRequests";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.institution_id) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Onboarding route - requires auth but not completed profile
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.institution_id) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse/:category"
        element={
          <ProtectedRoute>
            <BrowseCategoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:id"
        element={
          <ProtectedRoute>
            <BookDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-book"
        element={
          <ProtectedRoute>
            <AddBookPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nilkhet"
        element={
          <ProtectedRoute>
            <NilkhetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nilkhet/:id"
        element={
          <ProtectedRoute>
            <NilkhetBookDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-demand"
        element={
          <ProtectedRoute>
            <BookDemandPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department-requests"
        element={
          <ProtectedRoute>
            <DepartmentRequestsPage />
          </ProtectedRoute>
        }
      />
      {/* Redirect old /browse to /home */}
      <Route path="/browse" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
