import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, User, BookOpen, Eye, EyeOff, Phone } from 'lucide-react';
import { useAllProfiles, useUserBooks, useUpdateBookStatus } from '@/hooks/useAdmin';
import { toast } from 'sonner';

const AdminUsersTab = () => {
  const { data: profiles = [], isLoading } = useAllProfiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userBooksOpen, setUserBooksOpen] = useState(false);

  const { data: userBooks = [] } = useUserBooks(selectedUserId || '');
  const updateBookStatus = useUpdateBookStatus();

  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone_number.includes(searchQuery)
  );

  const handleViewBooks = (userId: string) => {
    setSelectedUserId(userId);
    setUserBooksOpen(true);
  };

  const handleUnpublishBook = async (bookId: string) => {
    try {
      await updateBookStatus.mutateAsync({ id: bookId, status: 'sold' });
      toast.success('Book unpublished successfully');
    } catch {
      toast.error('Failed to unpublish book');
    }
  };

  const handlePublishBook = async (bookId: string) => {
    try {
      await updateBookStatus.mutateAsync({ id: bookId, status: 'available' });
      toast.success('Book published successfully');
    } catch {
      toast.error('Failed to publish book');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            All Users ({filteredProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {profile.phone_number}
                    </div>
                    {profile.whatsapp_number && (
                      <div className="text-xs text-muted-foreground">
                        WA: {profile.whatsapp_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {profile.institution?.name || 'N/A'}
                    </div>
                    {profile.department?.name && (
                      <div className="text-xs text-muted-foreground">
                        {profile.department.name}
                      </div>
                    )}
                    {profile.academic_department?.name && (
                      <div className="text-xs text-muted-foreground">
                        {profile.academic_department.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBooks(profile.user_id)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Books
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Books Dialog */}
      <Dialog open={userBooksOpen} onOpenChange={setUserBooksOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User's Books</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {userBooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No books listed by this user
              </p>
            ) : (
              userBooks.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {book.photo_url ? (
                            <img
                              src={book.photo_url}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {book.author}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            ৳{book.price.toLocaleString()}
                          </p>
                          <Badge
                            variant={book.status === 'available' ? 'success' : 'secondary'}
                          >
                            {book.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        {book.status === 'available' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUnpublishBook(book.id)}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublishBook(book.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersTab;