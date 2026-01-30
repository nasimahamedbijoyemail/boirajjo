import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Book, BookWithSeller, BookCondition, BookStatus, BookType } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

interface CreateBookData {
  title: string;
  author: string;
  price: number;
  condition: BookCondition;
  photo_url?: string | null;
  book_type?: BookType;
  is_admin_listing?: boolean;
}

interface UpdateBookData extends Partial<CreateBookData> {
  status?: BookStatus;
}

export const useBooks = (filters?: {
  search?: string;
  subcategory?: string;
  bookType?: 'academic' | 'non_academic' | 'nilkhet';
}) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['books', profile?.institution_id, filters],
    queryFn: async () => {
      // For nilkhet books, don't require institution
      if (filters?.bookType === 'nilkhet') {
        let query = supabase
          .from('books')
          .select(`
            *,
            seller:profiles!books_seller_id_fkey(*),
            institution:institutions(*)
          `)
          .eq('book_type', 'nilkhet')
          .eq('is_admin_listing', true)
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        return data as BookWithSeller[];
      }

      // For non-academic books, show all
      if (filters?.bookType === 'non_academic') {
        let query = supabase
          .from('books')
          .select(`
            *,
            seller:profiles!books_seller_id_fkey(*),
            institution:institutions(*)
          `)
          .eq('book_type', 'non_academic')
          .eq('status', 'available')
          .order('created_at', { ascending: false });

        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as BookWithSeller[];
      }

      // For academic books, require institution
      if (!profile?.institution_id) return [];

      let query = supabase
        .from('books')
        .select(`
          *,
          seller:profiles!books_seller_id_fkey(*),
          institution:institutions(*)
        `)
        .eq('institution_id', profile.institution_id)
        .eq('book_type', 'academic')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BookWithSeller[];
    },
    enabled: filters?.bookType === 'nilkhet' || filters?.bookType === 'non_academic' || !!profile?.institution_id,
  });
};

export const useMyBooks = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['my-books', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          institution:institutions(*)
        `)
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BookWithSeller[];
    },
    enabled: !!profile?.id,
  });
};

export const useBook = (bookId: string) => {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          seller:profiles!books_seller_id_fkey(*),
          institution:institutions(*)
        `)
        .eq('id', bookId)
        .single();

      if (error) throw error;
      return data as BookWithSeller;
    },
    enabled: !!bookId,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateBookData) => {
      if (!profile) throw new Error('Not authenticated');

      const insertData: Record<string, unknown> = {
        title: data.title,
        author: data.author,
        price: data.price,
        condition: data.condition,
        photo_url: data.photo_url,
        seller_id: profile.id,
        institution_id: profile.institution_id!,
        institution_type: profile.institution_type!,
        subcategory: profile.subcategory,
        book_type: data.book_type || 'academic',
        is_admin_listing: data.is_admin_listing || false,
      };

      const { data: book, error } = await supabase
        .from('books')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return book;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBookData & { id: string }) => {
      const { data: book, error } = await supabase
        .from('books')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return book;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
    },
  });
};
