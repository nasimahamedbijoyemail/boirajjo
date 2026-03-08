import { BookWithSeller } from '@/types/database';
import { BookCard } from './BookCard';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BookGridProps {
  books: BookWithSeller[];
  loading?: boolean;
  emptyMessage?: string;
  isNilkhet?: boolean;
}

const BookSkeleton = ({ index }: { index: number }) => (
  <div className="animate-fade-in rounded-xl overflow-hidden shadow-card" style={{ animationDelay: `${index * 60}ms` }}>
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-3 sm:p-4 space-y-2.5 bg-card">
      <Skeleton className="h-4 sm:h-5 w-3/4" />
      <Skeleton className="h-3.5 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 sm:h-6 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export const BookGrid = ({ books, loading, emptyMessage = 'No books found', isNilkhet = false }: BookGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <BookSkeleton key={i} index={i} />
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} isNilkhet={isNilkhet} />
      ))}
    </div>
  );
};
