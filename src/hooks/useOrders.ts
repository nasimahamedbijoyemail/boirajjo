import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface CreateOrderData {
  book_id: string;
  quantity?: number;
  total_price: number;
  division_id?: string;
  district_id?: string;
  thana_id?: string;
  ward_id?: string;
  detail_address?: string;
}

export const useMyOrders = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          book:books(*),
          division:bd_divisions(*),
          district:bd_districts(*),
          thana:bd_thanas(*),
          ward:bd_wards(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user?.id && !!profile?.id,
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profile:profiles(*),
          book:books(*),
          division:bd_divisions(*),
          district:bd_districts(*),
          thana:bd_thanas(*),
          ward:bd_wards(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          ...data,
          user_id: user.id,
          profile_id: profile.id,
          quantity: data.quantity || 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'order',
          title: 'New Order Received',
          message: `New order placed by ${profile.name}`,
          reference_id: order.id,
        },
      });

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: OrderStatus; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
};
