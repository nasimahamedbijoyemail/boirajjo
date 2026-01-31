import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DepartmentBookRequest {
  id: string;
  user_id: string;
  profile_id: string;
  department_id: string | null;
  academic_department_id: string | null;
  institution_id: string;
  title: string;
  author_name: string | null;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    name: string;
    phone_number: string;
    whatsapp_number: string | null;
  };
}

interface CreateRequestData {
  title: string;
  author_name?: string;
}

export const useDepartmentRequests = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['department-requests', profile?.department_id, profile?.academic_department_id],
    queryFn: async () => {
      if (!user?.id || !profile?.id) return [];

      const { data, error } = await supabase
        .from('department_book_requests')
        .select(`
          *,
          profile:profiles(id, name, phone_number, whatsapp_number)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DepartmentBookRequest[];
    },
    enabled: !!user?.id && !!profile?.id,
  });
};

export const useMyDepartmentRequests = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['my-department-requests', user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.id) return [];

      const { data, error } = await supabase
        .from('department_book_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DepartmentBookRequest[];
    },
    enabled: !!user?.id && !!profile?.id,
  });
};

export const useCreateDepartmentRequest = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateRequestData) => {
      if (!user?.id || !profile?.id || !profile?.institution_id) {
        throw new Error('Not authenticated or missing profile data');
      }

      const { data: request, error } = await supabase
        .from('department_book_requests')
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          department_id: profile.department_id,
          academic_department_id: profile.academic_department_id,
          institution_id: profile.institution_id,
          title: data.title,
          author_name: data.author_name || null,
        })
        .select()
        .single();

      if (error) throw error;
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-department-requests'] });
    },
  });
};

export const useUpdateDepartmentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'open' | 'fulfilled' | 'closed' }) => {
      const { data, error } = await supabase
        .from('department_book_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-department-requests'] });
    },
  });
};

export const useDeleteDepartmentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('department_book_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-department-requests'] });
    },
  });
};
