import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ContactUnlockPayment } from '@/types/shop';

export const useMyContactUnlocks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-contact-unlocks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('contact_unlock_payments')
        .select(`
          *,
          book:books(id, title, author, price, seller_id, seller:profiles(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactUnlockPayment[];
    },
    enabled: !!user?.id,
  });
};

export const useContactUnlockForBook = (bookId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contact-unlock', bookId, user?.id],
    queryFn: async () => {
      if (!user?.id || !bookId) return null;

      const { data, error } = await supabase
        .from('contact_unlock_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) throw error;
      return data as ContactUnlockPayment | null;
    },
    enabled: !!user?.id && !!bookId,
  });
};

export const useCreateContactUnlock = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: { book_id: string; amount: number; bkash_number: string }) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      // Generate a temporary transaction number (will be replaced by trigger)
      const tempTxnNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data: payment, error } = await supabase
        .from('contact_unlock_payments')
        .insert({
          book_id: data.book_id,
          amount: data.amount,
          bkash_number: data.bkash_number,
          user_id: user.id,
          profile_id: profile.id,
          transaction_number: tempTxnNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return payment as ContactUnlockPayment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-contact-unlocks'] });
      queryClient.invalidateQueries({ queryKey: ['contact-unlock', variables.book_id] });
      queryClient.invalidateQueries({ queryKey: ['all-contact-unlocks'] });
    },
  });
};

export const useAllContactUnlocks = () => {
  return useQuery({
    queryKey: ['all-contact-unlocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_unlock_payments')
        .select(`
          *,
          profile:profiles(*),
          book:books(id, title, author, price, seller_id, seller:profiles(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactUnlockPayment[];
    },
  });
};

export const useUpdateContactUnlockStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: 'approved' | 'rejected'; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('contact_unlock_payments')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ContactUnlockPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-contact-unlocks'] });
      queryClient.invalidateQueries({ queryKey: ['my-contact-unlocks'] });
      queryClient.invalidateQueries({ queryKey: ['contact-unlock'] });
    },
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase
        .from('contact_unlock_payments')
        .update({ 
          refund_requested: true, 
          refund_requested_at: new Date().toISOString() 
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data as ContactUnlockPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-contact-unlocks'] });
      queryClient.invalidateQueries({ queryKey: ['all-contact-unlocks'] });
    },
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approved, notes }: { id: string; approved: boolean; notes?: string }) => {
      const { data, error } = await supabase
        .from('contact_unlock_payments')
        .update({ 
          refund_approved: approved,
          refund_approved_at: new Date().toISOString(),
          refund_notes: notes || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ContactUnlockPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-contact-unlocks'] });
      queryClient.invalidateQueries({ queryKey: ['my-contact-unlocks'] });
    },
  });
};
