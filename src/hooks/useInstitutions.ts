import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Institution, Department, InstitutionType } from '@/types/database';

export const useInstitutions = (type?: InstitutionType) => {
  return useQuery({
    queryKey: ['institutions', type],
    queryFn: async () => {
      let query = supabase.from('institutions').select('*').order('name');
      
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Institution[];
    },
  });
};

export const useDepartments = (institutionId?: string) => {
  return useQuery({
    queryKey: ['departments', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('institution_id', institutionId)
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
    enabled: !!institutionId,
  });
};
