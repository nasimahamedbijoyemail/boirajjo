import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EuProduct {
  id: string;
  title: string;
  author: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  price: number;
  currency: string;
  condition: string;
  photo_url: string | null;
  stock: number;
  is_available: boolean;
  city: string | null;
  country: string | null;
  delivery_days_min: number | null;
  delivery_days_max: number | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface EuProductRequest {
  id: string;
  user_id: string;
  title: string;
  author_name: string | null;
  description: string | null;
  preferred_city: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEuProducts = (category?: string, city?: string) => {
  return useQuery({
    queryKey: ['eu-products', category, city],
    queryFn: async () => {
      let query = supabase
        .from('eu_products')
        .select('*')
        .eq('is_available', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EuProduct[];
    },
  });
};

export const useEuProduct = (id: string) => {
  return useQuery({
    queryKey: ['eu-product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eu_products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as EuProduct;
    },
    enabled: !!id,
  });
};

export const useEuProductRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['eu-product-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eu_product_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EuProductRequest[];
    },
    enabled: !!user,
  });
};

export const useCreateEuProductRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { title: string; author_name?: string; description?: string; preferred_city?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('eu_product_requests').insert({
        user_id: user.id,
        title: data.title,
        author_name: data.author_name || null,
        description: data.description || null,
        preferred_city: data.preferred_city || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eu-product-requests'] });
      toast.success('Request submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit request');
    },
  });
};

// Admin hooks
export const useAllEuProducts = () => {
  return useQuery({
    queryKey: ['admin-eu-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eu_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EuProduct[];
    },
  });
};

export const useAllEuProductRequests = () => {
  return useQuery({
    queryKey: ['admin-eu-product-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eu_product_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EuProductRequest[];
    },
  });
};

export const useCreateEuProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<EuProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase.from('eu_products').insert(product);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-eu-products'] });
      queryClient.invalidateQueries({ queryKey: ['eu-products'] });
      toast.success('Product added!');
    },
    onError: () => toast.error('Failed to add product'),
  });
};

export const useUpdateEuProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EuProduct> & { id: string }) => {
      const { error } = await supabase.from('eu_products').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-eu-products'] });
      queryClient.invalidateQueries({ queryKey: ['eu-products'] });
      toast.success('Product updated!');
    },
    onError: () => toast.error('Failed to update product'),
  });
};

export const useUpdateEuProductRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; admin_notes?: string }) => {
      const { error } = await supabase.from('eu_product_requests').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-eu-product-requests'] });
      queryClient.invalidateQueries({ queryKey: ['eu-product-requests'] });
      toast.success('Request updated!');
    },
    onError: () => toast.error('Failed to update request'),
  });
};
