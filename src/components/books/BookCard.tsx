import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookWithSeller } from '@/types/database';
import { BookOpen, MapPin } from 'lucide-react';

interface BookCardProps {
  book: BookWithSeller;
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

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link to={`/book/${book.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in">
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          {book.photo_url ? (
            <img
              src={book.photo_url}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <Badge
            variant={conditionColors[book.condition]}
            className="absolute top-2 right-2"
          >
            {conditionLabels[book.condition]}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            by {book.author}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ৳{book.price.toLocaleString()}
            </span>
            {book.institution && (
              <Badge variant="institution" className="text-xs max-w-[120px] truncate">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{book.institution.name}</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
