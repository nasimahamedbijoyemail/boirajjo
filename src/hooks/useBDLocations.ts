import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BDDivision, BDDistrict, BDThana, BDWard } from '@/types/database';

export const useDivisions = () => {
  return useQuery({
    queryKey: ['bd-divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bd_divisions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BDDivision[];
    },
  });
};

export const useDistricts = (divisionId?: string) => {
  return useQuery({
    queryKey: ['bd-districts', divisionId],
    queryFn: async () => {
      if (!divisionId) return [];
      
      const { data, error } = await supabase
        .from('bd_districts')
        .select('*')
        .eq('division_id', divisionId)
        .order('name');
      
      if (error) throw error;
      return data as BDDistrict[];
    },
    enabled: !!divisionId,
  });
};

export const useThanas = (districtId?: string) => {
  return useQuery({
    queryKey: ['bd-thanas', districtId],
    queryFn: async () => {
      if (!districtId) return [];
      
      const { data, error } = await supabase
        .from('bd_thanas')
        .select('*')
        .eq('district_id', districtId)
        .order('name');
      
      if (error) throw error;
      return data as BDThana[];
    },
    enabled: !!districtId,
  });
};

export const useWards = (thanaId?: string) => {
  return useQuery({
    queryKey: ['bd-wards', thanaId],
    queryFn: async () => {
      if (!thanaId) return [];
      
      const { data, error } = await supabase
        .from('bd_wards')
        .select('*')
        .eq('thana_id', thanaId)
        .order('name');
      
      if (error) throw error;
      return data as BDWard[];
    },
    enabled: !!thanaId,
  });
};
