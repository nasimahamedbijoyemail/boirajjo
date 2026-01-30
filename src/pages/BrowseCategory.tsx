import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BookGrid } from '@/components/books/BookGrid';
import { SearchBar } from '@/components/books/SearchBar';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

const BrowseCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  const debouncedSearch = useDebounce(search, 300);

  const bookType = category === 'non-academic' ? 'non_academic' : 'academic';

  const filters = useMemo(() => ({
    search: debouncedSearch,
    subcategory: subcategory === 'all' ? '' : subcategory,
    bookType: bookType as 'academic' | 'non_academic',
  }), [debouncedSearch, subcategory, bookType]);

  const { data: books = [], isLoading } = useBooks(filters);

  const title = category === 'non-academic' ? 'Non-Academic Books' : 'Academic Books';
  const description = category === 'non-academic' 
    ? 'Browse general books from all users' 
    : 'Showing books from your campus';

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          subcategory={subcategory}
          onSubcategoryChange={setSubcategory}
          hideFilters={category === 'non-academic'}
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

export default BrowseCategoryPage;
