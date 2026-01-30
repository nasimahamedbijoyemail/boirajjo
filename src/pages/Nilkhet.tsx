import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BookGrid } from '@/components/books/BookGrid';
import { SearchBar } from '@/components/books/SearchBar';
import { useBooks } from '@/hooks/useBooks';
import { useDebounce } from '@/hooks/useDebounce';

const NilkhetPage = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: books = [], isLoading } = useBooks({ bookType: 'nilkhet' });

  const filteredBooks = useMemo(() => {
    if (!debouncedSearch) return books;
    const searchLower = debouncedSearch.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower)
    );
  }, [books, debouncedSearch]);

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Nilkhet Books
          </h1>
          <p className="text-muted-foreground">
            Order books with cash on delivery
          </p>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          subcategory=""
          onSubcategoryChange={() => {}}
          hideFilters
        />

        <BookGrid
          books={filteredBooks}
          loading={isLoading}
          emptyMessage="No Nilkhet books available yet"
          isNilkhet
        />
      </div>
    </Layout>
  );
};

export default NilkhetPage;
