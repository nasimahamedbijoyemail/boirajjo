import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useAdmin';
import {
  Home, Search, Plus, ShoppingBag, User, List, History, BookMarked, Store, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/browse/academic', icon: Search, label: 'In Your Campus' },
  { to: '/browse/non-academic', icon: Search, label: 'Outside Campus' },
  { to: '/nilkhet', icon: Store, label: 'Nilkhet' },
  { to: '/book-demand', icon: BookMarked, label: 'Demand A Book' },
  { to: '/add-book', icon: Plus, label: 'Sell Book', accent: true },
];

const secondaryItems = [
  { to: '/my-listings', icon: List, label: 'My Listings' },
  { to: '/my-orders', icon: ShoppingBag, label: 'My Orders' },
  { to: '/transaction-history', icon: History, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const DesktopSidebar = () => {
  const { profile } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r bg-card/50 overflow-y-auto scrollbar-thin">
      {/* Profile summary */}
      <div className="p-4 border-b">
        <Link to="/profile" className="flex items-center gap-3 group">
          <ProfileAvatar
            photoUrl={profile?.photo_url || null}
            name={profile?.name || ''}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {profile?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.subcategory || 'Student'}
            </p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Explore
        </p>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              item.accent
                ? 'gradient-accent text-accent-foreground shadow-sm hover:shadow-md mt-2'
                : isActive(item.to)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <item.icon className={cn('h-4 w-4 shrink-0', item.accent && 'text-accent-foreground')} />
            {item.label}
          </Link>
        ))}

        <div className="border-t my-3" />

        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Account
        </p>
        {secondaryItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(item.to)
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive('/admin')
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  );
};
