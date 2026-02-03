import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shop, ShopBook, ShopOrder, ShopRating } from '@/types/shop';

// Shops
export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('rating_average', { ascending: false });

      if (error) throw error;
      return data as Shop[];
    },
  });
};

export const useShop = (id: string) => {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Shop;
    },
    enabled: !!id,
  });
};

export const useMyShop = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-shop', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Shop | null;
    },
    enabled: !!user?.id,
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<Shop, 'id' | 'user_id' | 'is_verified' | 'is_active' | 'rating_average' | 'rating_count' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: shop, error } = await supabase
        .from('shops')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return shop as Shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

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
      return data as Shop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

// Shop Books
export const useShopBooks = (shopId?: string, filters?: { condition_type?: 'old' | 'new'; category?: string; subcategory?: string }) => {
  return useQuery({
    queryKey: ['shop-books', shopId, filters],
    queryFn: async () => {
      let query = supabase
        .from('shop_books')
        .select(`
          *,
          shop:shops(*)
        `)
        .eq('is_available', true);

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      if (filters?.condition_type) {
        query = query.eq('book_condition_type', filters.condition_type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopBook[];
    },
  });
};

export const useShopBook = (id: string) => {
  return useQuery({
    queryKey: ['shop-book', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_books')
        .select(`
          *,
          shop:shops(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ShopBook;
    },
    enabled: !!id,
  });
};

export const useMyShopBooks = () => {
  const { data: myShop } = useMyShop();

  return useQuery({
    queryKey: ['my-shop-books', myShop?.id],
    queryFn: async () => {
      if (!myShop?.id) return [];

      const { data, error } = await supabase
        .from('shop_books')
        .select('*')
        .eq('shop_id', myShop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopBook[];
    },
    enabled: !!myShop?.id,
  });
};

export const useCreateShopBook = () => {
  const queryClient = useQueryClient();
  const { data: myShop } = useMyShop();

  return useMutation({
    mutationFn: async (data: Omit<ShopBook, 'id' | 'shop_id' | 'is_available' | 'created_at' | 'updated_at' | 'shop'>) => {
      if (!myShop?.id) throw new Error('No shop found');

      const { data: book, error } = await supabase
        .from('shop_books')
        .insert({
          ...data,
          shop_id: myShop.id,
        })
        .select()
        .single();

      if (error) throw error;
      return book as ShopBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop-books'] });
      queryClient.invalidateQueries({ queryKey: ['shop-books'] });
    },
  });
};

export const useUpdateShopBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShopBook> & { id: string }) => {
      const { data, error } = await supabase
        .from('shop_books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ShopBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop-books'] });
      queryClient.invalidateQueries({ queryKey: ['shop-books'] });
    },
  });
};

export const useDeleteShopBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shop_books')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop-books'] });
      queryClient.invalidateQueries({ queryKey: ['shop-books'] });
    },
  });
};

// Shop Orders
export const useShopOrders = () => {
  const { data: myShop } = useMyShop();

  return useQuery({
    queryKey: ['shop-orders', myShop?.id],
    queryFn: async () => {
      if (!myShop?.id) return [];

      const { data, error } = await supabase
        .from('shop_orders')
        .select(`
          *,
          shop_book:shop_books(*),
          profile:profiles(*)
        `)
        .eq('shop_id', myShop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopOrder[];
    },
    enabled: !!myShop?.id,
  });
};

export const useMyShopOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-shop-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('shop_orders')
        .select(`
          *,
          shop:shops(*),
          shop_book:shop_books(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopOrder[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateShopOrder = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { shop_id: string; shop_book_id: string; quantity: number; total_price: number; division_id?: string; district_id?: string; thana_id?: string; detail_address?: string; customer_notes?: string }) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const { data: order, error } = await supabase
        .from('shop_orders')
        .insert({
          ...data,
          user_id: user.id,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return order as ShopOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
    },
  });
};

export const useUpdateShopOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, shop_notes }: { id: string; status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled'; shop_notes?: string }) => {
      const { data, error } = await supabase
        .from('shop_orders')
        .update({ status, shop_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ShopOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-shop-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
    },
  });
};

// Shop Ratings
export const useShopRatings = (shopId: string) => {
  return useQuery({
    queryKey: ['shop-ratings', shopId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_ratings')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopRating[];
    },
    enabled: !!shopId,
  });
};

export const useCreateShopRating = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { shop_id: string; rating: number; review?: string; shop_order_id?: string }) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const { data: rating, error } = await supabase
        .from('shop_ratings')
        .insert({
          ...data,
          user_id: user.id,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return rating as ShopRating;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shop-ratings', variables.shop_id] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop', variables.shop_id] });
    },
  });
};
