import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <SEOHead title="Page Not Found" path={location.pathname} />
      <div className="text-center max-w-md mx-auto animate-fade-in-up">
        <div className="mx-auto mb-6 gradient-primary rounded-2xl p-4 w-fit shadow-card">
          <BookOpen className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-7xl font-extrabold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" size="lg" asChild>
            <Link to="/home">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
