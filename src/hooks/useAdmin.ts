import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNotification, Profile, Book } from '@/types/database';
import { Shop, ShopBook, ShopOrder } from '@/types/shop';

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
      const [ordersRes, demandsRes, booksRes, usersRes, shopsRes, shopOrdersRes, paymentsRes] = await Promise.all([
        supabase.from('orders').select('id, status', { count: 'exact' }),
        supabase.from('book_demands').select('id, status', { count: 'exact' }),
        supabase.from('books').select('id, book_type', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('shops').select('id', { count: 'exact' }),
        supabase.from('shop_orders').select('id, status', { count: 'exact' }),
        supabase.from('contact_unlock_payments').select('id, status', { count: 'exact' }),
      ]);

      const pendingOrders = ordersRes.data?.filter(o => o.status === 'pending').length || 0;
      const pendingDemands = demandsRes.data?.filter(d => d.status === 'requested').length || 0;
      const nilkhetBooks = booksRes.data?.filter(b => b.book_type === 'nilkhet').length || 0;
      const pendingShopOrders = shopOrdersRes.data?.filter(o => o.status === 'pending').length || 0;
      const pendingPayments = paymentsRes.data?.filter(p => p.status === 'pending').length || 0;

      return {
        totalOrders: ordersRes.count || 0,
        pendingOrders,
        totalDemands: demandsRes.count || 0,
        pendingDemands,
        totalBooks: booksRes.count || 0,
        nilkhetBooks,
        totalUsers: usersRes.count || 0,
        totalShops: shopsRes.count || 0,
        totalShopOrders: shopOrdersRes.count || 0,
        pendingShopOrders,
        pendingPayments,
      };
    },
  });
};

// All Profiles
export interface ProfileWithRelations extends Profile {
  institution?: { id: string; name: string; type: string };
  department?: { id: string; name: string };
  academic_department?: { id: string; name: string };
}

export const useAllProfiles = () => {
  return useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          institution:institutions(*),
          department:departments(*),
          academic_department:academic_departments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProfileWithRelations[];
    },
  });
};

// User's books by user_id
export const useUserBooks = (userId: string) => {
  return useQuery({
    queryKey: ['user-books', userId],
    queryFn: async () => {
      if (!userId) return [];

      // First get the profile id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profile) return [];

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Book[];
    },
    enabled: !!userId,
  });
};

// Update book status (for unpublishing)
export const useUpdateBookStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'available' | 'sold' }) => {
      const { data, error } = await supabase
        .from('books')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

// All Shops (including inactive)
export const useAllShops = () => {
  return useQuery({
    queryKey: ['all-shops-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Shop[];
    },
  });
};

// Shop books by shop_id (admin - including unavailable)
export const useShopBooksAdmin = (shopId: string) => {
  return useQuery({
    queryKey: ['shop-books-admin', shopId],
    queryFn: async () => {
      if (!shopId) return [];

      const { data, error } = await supabase
        .from('shop_books')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopBook[];
    },
    enabled: !!shopId,
  });
};

// Update shop (activate/deactivate/verify)
export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Shop> & { id: string }) => {
      const { data, error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-shops-admin'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

// Update shop book availability
export const useUpdateShopBookAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { data, error } = await supabase
        .from('shop_books')
        .update({ is_available })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-books-admin'] });
      queryClient.invalidateQueries({ queryKey: ['shop-books'] });
    },
  });
};

// All shop orders
export const useAllShopOrders = () => {
  return useQuery({
    queryKey: ['all-shop-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_orders')
        .select(`
          *,
          shop:shops(*),
          shop_book:shop_books(*),
          profile:profiles(*),
          division:bd_divisions(*),
          district:bd_districts(*),
          thana:bd_thanas(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopOrder[];
    },
  });
};

// Update shop order status (admin)
export const useUpdateShopOrderStatusAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled'; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('shop_orders')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-shop-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
    },
  });
};
