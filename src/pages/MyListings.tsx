import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMyBooks, useUpdateBook, useDeleteBook } from '@/hooks/useBooks';
import { BookOpen, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const conditionLabels = {
  new: 'New',
  good: 'Good',
  worn: 'Worn',
};

const MyListingsPage = () => {
  const { data: books = [], isLoading } = useMyBooks();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const handleMarkAsSold = async (bookId: string) => {
    try {
      await updateBook.mutateAsync({ id: bookId, status: 'sold' });
      toast.success('Book marked as sold!');
    } catch {
      toast.error('Failed to update book');
    }
  };

  const handleDelete = async (bookId: string) => {
    try {
      await deleteBook.mutateAsync(bookId);
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const availableBooks = books.filter((b) => b.status === 'available');
  const soldBooks = books.filter((b) => b.status === 'sold');

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground">Manage your book listings</p>
          </div>
          <Button variant="accent" asChild>
            <Link to="/add-book">
              <Plus className="h-4 w-4" />
              Add Book
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-6 bg-muted rounded w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start selling your used books to fellow students
            </p>
            <Button variant="hero" asChild>
              <Link to="/add-book">
                <Plus className="h-4 w-4" />
                Add Your First Book
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {availableBooks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Available ({availableBooks.length})</h2>
                <div className="grid gap-4">
                  {availableBooks.map((book) => (
                    <Card key={book.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Link to={`/book/${book.id}`} className="shrink-0">
                            <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted">
                              {book.photo_url ? (
                                <img
                                  src={book.photo_url}
                                  alt={book.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/book/${book.id}`}>
                              <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                                {book.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              by {book.author}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-primary">
                                ৳{book.price.toLocaleString()}
                              </span>
                              <Badge variant="secondary">{conditionLabels[book.condition]}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsSold(book.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="hidden sm:inline">Sold</span>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/edit-book/${book.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline">Edit</span>
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove "{book.title}" from your listings.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(book.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {soldBooks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground">Sold ({soldBooks.length})</h2>
                <div className="grid gap-4 opacity-60">
                  {soldBooks.map((book) => (
                    <Card key={book.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
                            {book.photo_url ? (
                              <img
                                src={book.photo_url}
                                alt={book.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {book.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              by {book.author}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-muted-foreground">
                                ৳{book.price.toLocaleString()}
                              </span>
                              <Badge variant="destructive">Sold</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyListingsPage;
