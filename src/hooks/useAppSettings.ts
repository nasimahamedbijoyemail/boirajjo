import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentEnabled = () => {
  return useQuery({
    queryKey: ['app-settings', 'payment_enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'payment_enabled')
        .single();

      if (error) return false;
      return data?.value === true;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTogglePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: enabled as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq('key', 'payment_enabled');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings', 'payment_enabled'] });
    },
  });
};
