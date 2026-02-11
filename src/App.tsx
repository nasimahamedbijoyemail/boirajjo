import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { toast } from "sonner";
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
import ShopAuthPage from "./pages/ShopAuth";
import ShopDashboard from "./pages/ShopDashboard";
import ShopDetailsPage from "./pages/ShopDetails";
import ShopBookDetailsPage from "./pages/ShopBookDetails";
import TransactionHistory from "./pages/TransactionHistory";

const queryClient = new QueryClient();

/**
 * Mobile Back Button Handler Component
 */
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastPressRef = useRef<number>(0);

  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      // Prevent default browser behavior
      e.preventDefault();

      // Define pages where the app should exit
      const isAtRoot = location.pathname === "/home" || location.pathname === "/" || location.pathname === "/auth";

      if (!isAtRoot) {
        // If not at home, just go back one step in the app
        navigate(-1);
      } else {
        // If at home, require a double-press to exit (Standard Android Behavior)
        const now = Date.now();
        if (now - lastPressRef.current < 2000) {
          // If pressed twice within 2 seconds, we let it exit (standard behavior)
          // In a wrapped app, this will close the activity
        } else {
          lastPressRef.current = now;
          toast("Press back again to exit", {
            duration: 2000,
            position: "bottom-center",
          });
          // Re-push state to keep the user on the current page
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    // Push an initial state so there's something to "pop"
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [location, navigate]);

  return null; // This component just runs the logic
};

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
    <>
      <BackButtonHandler />
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
          path="/transaction-history"
          element={
            <ProtectedRoute>
              <TransactionHistory />
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
        <Route path="/shop" element={<ShopAuthPage />} />
        <Route path="/shop/dashboard" element={<ShopDashboard />} />
        <Route
          path="/nilkhet/shop/:id"
          element={
            <ProtectedRoute>
              <ShopDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nilkhet/book/:id"
          element={
            <ProtectedRoute>
              <ShopBookDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/browse" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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
