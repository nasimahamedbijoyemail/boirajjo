import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookWithSeller } from '@/types/database';
import { BookOpen, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: BookWithSeller;
  isNilkhet?: boolean;
}

const conditionLabels = {
  new: 'New',
  good: 'Good',
  worn: 'Worn',
};

const conditionColors = {
  new: 'success',
  good: 'secondary',
  worn: 'warning',
} as const;

export const BookCard = ({ book, isNilkhet = false }: BookCardProps) => {
  const linkPath = isNilkhet ? `/nilkhet/${book.id}` : `/book/${book.id}`;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link to={linkPath} className="block">
      <Card className="group overflow-hidden border-0 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.97] active:shadow-sm">
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          {book.photo_url && !imageError ? (
            <>
              {/* Shimmer placeholder while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/60 to-muted animate-pulse" />
              )}
              <img
                src={book.photo_url}
                alt={book.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={cn(
                  'h-full w-full object-cover transition-all duration-500 group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/40" />
            </div>
          )}
          <Badge
            variant={conditionColors[book.condition]}
            className="absolute top-2 right-2 shadow-sm text-[10px] sm:text-xs"
          >
            {conditionLabels[book.condition]}
          </Badge>
          {book.status === 'sold' && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-sm font-bold px-4 py-1">Sold</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-[13px] sm:text-base leading-tight">
            {book.title}
          </h3>
          <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
            by {book.author}
          </p>
          <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
            <span className="text-base sm:text-lg font-bold text-primary tabular-nums">
              ৳{book.price.toLocaleString()}
            </span>
            {book.institution && (
              <Badge variant="institution" className="text-[10px] sm:text-xs max-w-[100px] sm:max-w-[120px] truncate">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 flex-shrink-0" />
                <span className="truncate">{book.institution.name}</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
