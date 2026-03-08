import React from 'react';
import { Header } from './Header';
import { PageTransition } from './PageTransition';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, showHeader = true }, ref) => {
    return (
      <div ref={ref} className="min-h-screen bg-background">
        {showHeader && <Header />}
        <PageTransition>
          <main>{children}</main>
        </PageTransition>
      </div>
    );
  }
);

Layout.displayName = 'Layout';
