import { Header } from './Header';
import { PageTransition } from './PageTransition';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
    </div>
  );
};
