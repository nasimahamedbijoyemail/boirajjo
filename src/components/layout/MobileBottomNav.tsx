import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadNotificationsCount } from '@/hooks/useUserNotifications';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/nilkhet', icon: Search, label: 'Nilkhet' },
  { to: '/add-book', icon: Plus, label: 'Sell', accent: true },
  { to: '/my-orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/profile', icon: User, label: 'Profile', showBadge: true },
];

export const MobileBottomNav = () => {
  const { user, profile } = useAuth();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const location = useLocation();

  if (!user || !profile?.institution_id) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-bottom">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ to, icon: Icon, label, accent, showBadge }) => {
          const isActive = location.pathname === to || 
            (to === '/nilkhet' && location.pathname.startsWith('/nilkhet')) ||
            (to === '/my-orders' && location.pathname.startsWith('/my-orders')) ||
            (to === '/profile' && location.pathname.startsWith('/profile'));

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors',
                isActive && !accent && 'text-primary',
                !isActive && !accent && 'text-muted-foreground',
              )}
            >
              {accent ? (
                <div className="flex items-center justify-center h-10 w-10 -mt-4 rounded-full bg-accent text-accent-foreground shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              )}
              <span className={cn(
                'text-[10px] leading-tight',
                accent && 'text-accent-foreground font-semibold mt-0.5',
                isActive && !accent && 'font-semibold',
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
