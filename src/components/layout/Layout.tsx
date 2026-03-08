import React from 'react';
import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { MobileBottomNav } from './MobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, showHeader = true }, ref) => {
    return (
      <div ref={ref} className="min-h-screen bg-background pb-16 md:pb-0">
        {showHeader && <Header />}
        <PageTransition>
          <main>{children}</main>
        </PageTransition>
        <MobileBottomNav />
      </div>
    );
  }
);

Layout.displayName = 'Layout';
