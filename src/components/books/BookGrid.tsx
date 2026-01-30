import { BookWithSeller } from '@/types/database';
import { BookCard } from './BookCard';
import { BookOpen } from 'lucide-react';

interface BookGridProps {
  books: BookWithSeller[];
  loading?: boolean;
  emptyMessage?: string;
  isNilkhet?: boolean;
}

export const BookGrid = ({ books, loading, emptyMessage = 'No books found', isNilkhet = false }: BookGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-muted rounded-t-xl" />
            <div className="p-4 bg-card rounded-b-xl border-x border-b">
              <div className="h-5 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-5 bg-muted rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground max-w-md">
          Check back later or try adjusting your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} isNilkhet={isNilkhet} />
      ))}
    </div>
  );
};
