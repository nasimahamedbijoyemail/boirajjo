import React from 'react';
import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  hideSidebar?: boolean;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, showHeader = true, hideSidebar = false }, ref) => {
    const { user, profile } = useAuth();
    const showSidebar = !hideSidebar && !!user && !!profile?.institution_id;

    return (
      <div ref={ref} className="min-h-screen bg-background pb-16 md:pb-0">
        {showHeader && <Header />}
        <div className="flex w-full">
          {showSidebar && <DesktopSidebar />}
          <div className="flex-1 min-w-0">
            <PageTransition>
              <main>{children}</main>
            </PageTransition>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }
);

Layout.displayName = 'Layout';
