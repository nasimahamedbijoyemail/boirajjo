import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Uses secure RPC to read whitelisted public settings (non-admins can't query table directly)
const useAppSetting = (key: string) => {
  return useQuery({
    queryKey: ['app-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_setting', { setting_key: key });
      if (error) return null;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['app-settings', variables.key] });
    },
  });
};

// Payment toggle
export const usePaymentEnabled = () => {
  const { data, ...rest } = useAppSetting('payment_enabled');
  return { data: data === true, ...rest };
};

export const useTogglePayment = () => {
  const update = useUpdateSetting();
  return {
    ...update,
    mutateAsync: (enabled: boolean) => update.mutateAsync({ key: 'payment_enabled', value: enabled }),
  };
};

// Promo banner
export const usePromoBanner = () => {
  const { data: enabled, isLoading: l1 } = useAppSetting('promo_banner_enabled');
  const { data: imageUrl, isLoading: l2 } = useAppSetting('promo_banner_image_url');
  const { data: link, isLoading: l3 } = useAppSetting('promo_banner_link');

  return {
    data: {
      enabled: enabled === true,
      imageUrl: (typeof imageUrl === 'string' ? imageUrl : '') as string,
      link: (typeof link === 'string' ? link : '') as string,
    },
    isLoading: l1 || l2 || l3,
  };
};

export const useUpdatePromoBanner = () => {
  const update = useUpdateSetting();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banner: { enabled: boolean; imageUrl: string; link: string }) => {
      await Promise.all([
        update.mutateAsync({ key: 'promo_banner_enabled', value: banner.enabled }),
        update.mutateAsync({ key: 'promo_banner_image_url', value: banner.imageUrl }),
        update.mutateAsync({ key: 'promo_banner_link', value: banner.link }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
};
