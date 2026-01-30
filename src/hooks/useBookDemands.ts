import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookDemand, DemandStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface CreateDemandData {
  book_name: string;
  author_name?: string;
  division_id?: string;
  district_id?: string;
  thana_id?: string;
  ward_id?: string;
  detail_address?: string;
}

export const useMyDemands = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['my-demands', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.id) return [];

      const { data, error } = await supabase
        .from('book_demands')
        .select(`
          *,
          division:bd_divisions(*),
          district:bd_districts(*),
          thana:bd_thanas(*),
          ward:bd_wards(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BookDemand[];
    },
    enabled: !!user?.id && !!profile?.id,
  });
};

export const useAllDemands = () => {
  return useQuery({
    queryKey: ['all-demands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_demands')
        .select(`
          *,
          profile:profiles(*),
          division:bd_divisions(*),
          district:bd_districts(*),
          thana:bd_thanas(*),
          ward:bd_wards(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BookDemand[];
    },
  });
};

export const useCreateDemand = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateDemandData) => {
      if (!user?.id || !profile?.id) throw new Error('Not authenticated');

      const { data: demand, error } = await supabase
        .from('book_demands')
        .insert({
          ...data,
          user_id: user.id,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'book_demand',
          title: 'New Book Demand',
          message: `${profile.name} requested: ${data.book_name}`,
          reference_id: demand.id,
        },
      });

      return demand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
      queryClient.invalidateQueries({ queryKey: ['all-demands'] });
    },
  });
};

export const useUpdateDemandStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: DemandStatus; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('book_demands')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-demands'] });
      queryClient.invalidateQueries({ queryKey: ['all-demands'] });
    },
  });
};
