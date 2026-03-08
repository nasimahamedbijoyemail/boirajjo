import { lazy, Suspense, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { HelmetProvider } from "react-helmet-async";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/Auth"));
const OnboardingPage = lazy(() => import("./pages/Onboarding"));
const HomePage = lazy(() => import("./pages/Home"));
const BrowseCategoryPage = lazy(() => import("./pages/BrowseCategory"));
const BookDetailsPage = lazy(() => import("./pages/BookDetails"));
const AddBookPage = lazy(() => import("./pages/AddBook"));
const MyListingsPage = lazy(() => import("./pages/MyListings"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const NilkhetPage = lazy(() => import("./pages/Nilkhet"));
const NilkhetBookDetailsPage = lazy(() => import("./pages/NilkhetBookDetails"));
const BookDemandPage = lazy(() => import("./pages/BookDemand"));
const MyOrdersPage = lazy(() => import("./pages/MyOrders"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DepartmentRequestsPage = lazy(() => import("./pages/DepartmentRequests"));
const ShopAuthPage = lazy(() => import("./pages/ShopAuth"));
const ShopDashboard = lazy(() => import("./pages/ShopDashboard"));
const ShopDetailsPage = lazy(() => import("./pages/ShopDetails"));
const ShopBookDetailsPage = lazy(() => import("./pages/ShopBookDetails"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Mobile Back Button Handler Component
 */
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastPressRef = useRef<number>(0);

  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      const isAtRoot = location.pathname === "/home" || location.pathname === "/" || location.pathname === "/auth";

      if (!isAtRoot) {
        navigate(-1);
      } else {
        const now = Date.now();
        if (now - lastPressRef.current < 2000) {
          // let it exit
        } else {
          lastPressRef.current = now;
          toast("Press back again to exit", { duration: 2000, position: "bottom-center" });
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [location, navigate]);

  return null;
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.institution_id) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

// Onboarding route
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.institution_id) return <Navigate to="/home" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <>
      <BackButtonHandler />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageSkeleton />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/browse/:category" element={<ProtectedRoute><BrowseCategoryPage /></ProtectedRoute>} />
            <Route path="/book/:id" element={<ProtectedRoute><BookDetailsPage /></ProtectedRoute>} />
            <Route path="/add-book" element={<ProtectedRoute><AddBookPage /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/nilkhet" element={<ProtectedRoute><NilkhetPage /></ProtectedRoute>} />
            <Route path="/nilkhet/:id" element={<ProtectedRoute><NilkhetBookDetailsPage /></ProtectedRoute>} />
            <Route path="/book-demand" element={<ProtectedRoute><BookDemandPage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/department-requests" element={<ProtectedRoute><DepartmentRequestsPage /></ProtectedRoute>} />
            <Route path="/shop" element={<ShopAuthPage />} />
            <Route path="/shop/dashboard" element={<ShopDashboard />} />
            <Route path="/nilkhet/shop/:id" element={<ProtectedRoute><ShopDetailsPage /></ProtectedRoute>} />
            <Route path="/nilkhet/book/:id" element={<ProtectedRoute><ShopBookDetailsPage /></ProtectedRoute>} />
            <Route path="/browse" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
