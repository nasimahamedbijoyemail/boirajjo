import { BookWithSeller } from '@/types/database';
import { BookCard } from './BookCard';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookGridProps {
  books: BookWithSeller[];
  loading?: boolean;
  emptyMessage?: string;
  isNilkhet?: boolean;
}

const BookSkeleton = ({ index }: { index: number }) => (
  <div
    className="rounded-xl overflow-hidden shadow-card"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="aspect-[4/3] w-full animate-shimmer" />
    <div className="p-3 sm:p-4 space-y-2.5 bg-card">
      <div className="h-4 sm:h-5 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-3.5 w-1/2 rounded bg-muted animate-pulse" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-5 sm:h-6 w-16 rounded bg-muted animate-pulse" />
        <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
      </div>
    </div>
  </div>
);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="rounded-2xl bg-muted/60 p-6 mb-4">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Check back later or try adjusting your search filters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
    >
      {books.map((book) => (
        <motion.div key={book.id} variants={itemVariants}>
          <BookCard book={book} isNilkhet={isNilkhet} />
        </motion.div>
      ))}
    </motion.div>
  );
};
