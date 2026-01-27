import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BookGrid } from '@/components/books/BookGrid';
import { SearchBar } from '@/components/books/SearchBar';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

const BrowsePage = () => {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    subcategory: subcategory === 'all' ? '' : subcategory,
  }), [debouncedSearch, subcategory]);

  const { data: books = [], isLoading } = useBooks(filters);

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Browse Books
          </h1>
          {profile?.institution_id && (
            <p className="text-muted-foreground">
              Showing books from your campus
            </p>
          )}
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          subcategory={subcategory}
          onSubcategoryChange={setSubcategory}
        />

        <BookGrid
          books={books}
          loading={isLoading}
          emptyMessage={
            search
              ? 'No books found matching your search'
              : 'No books available yet'
          }
        />
      </div>
    </Layout>
  );
};

export default BrowsePage;
