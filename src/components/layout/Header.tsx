import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useUnreadNotificationsCount } from '@/hooks/useUserNotifications';
import { BookOpen, Plus, User, LogOut, Menu, X, Home, ShoppingBag, Settings, List, History, Bell } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <div className="gradient-primary rounded-lg p-2">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Boi Rajjo</span>
        </Link>

        {user && profile?.institution_id && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/home">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/my-listings">
                  <List className="h-4 w-4" />
                  My Listings
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/my-orders">
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/transaction-history">
                  <History className="h-4 w-4" />
                  History
                </Link>
              </Button>
              <Button variant="accent" size="sm" asChild>
                <Link to="/add-book">
                  <Plus className="h-4 w-4" />
                  Sell Book
                </Link>
              </Button>

              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/profile?tab=notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center animate-scale-in">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5 pl-1.5">
                    <ProfileAvatar 
                      photoUrl={profile?.photo_url || null} 
                      name={profile?.name || ''} 
                      size="sm"
                    />
                    <span className="hidden lg:inline">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Mobile: Bell + Menu */}
            <div className="flex items-center gap-1 md:hidden">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/profile?tab=notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center animate-scale-in">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </>
        )}

        {!user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && user && profile?.institution_id && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden border-t bg-card/95 backdrop-blur shadow-lg relative z-50"
          >
            <nav className="container py-4 flex flex-col gap-2">
            {/* Mobile profile header */}
            <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-muted/50">
              <ProfileAvatar 
                photoUrl={profile?.photo_url || null} 
                name={profile?.name || ''} 
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{profile?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/home">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/my-listings">
                <List className="h-4 w-4" />
                My Listings
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/my-orders">
                <ShoppingBag className="h-4 w-4" />
                My Orders
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/transaction-history">
                <History className="h-4 w-4" />
                Transaction History
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/profile">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </Button>
            {isAdmin && (
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                <Link to="/admin">
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
            <Button variant="accent" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to="/add-book">
                <Plus className="h-4 w-4" />
                Sell Book
              </Link>
            </Button>
            <div className="border-t border-border my-1" />
            <Button variant="ghost" className="justify-start text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
