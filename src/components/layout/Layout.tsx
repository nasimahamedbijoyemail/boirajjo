import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main>{children}</main>
    </div>
  );
};
