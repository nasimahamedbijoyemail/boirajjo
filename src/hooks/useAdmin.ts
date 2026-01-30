import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNotification } from '@/types/database';

export const useIsAdmin = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });
};

export const useAdminNotifications = () => {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AdminNotification[];
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ordersRes, demandsRes, booksRes, usersRes] = await Promise.all([
        supabase.from('orders').select('id, status', { count: 'exact' }),
        supabase.from('book_demands').select('id, status', { count: 'exact' }),
        supabase.from('books').select('id, book_type', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ]);

      const pendingOrders = ordersRes.data?.filter(o => o.status === 'pending').length || 0;
      const pendingDemands = demandsRes.data?.filter(d => d.status === 'requested').length || 0;
      const nilkhetBooks = booksRes.data?.filter(b => b.book_type === 'nilkhet').length || 0;

      return {
        totalOrders: ordersRes.count || 0,
        pendingOrders,
        totalDemands: demandsRes.count || 0,
        pendingDemands,
        totalBooks: booksRes.count || 0,
        nilkhetBooks,
        totalUsers: usersRes.count || 0,
      };
    },
  });
};
