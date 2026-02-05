import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageCircle, BookOpen, Send, Trash2 } from 'lucide-react';
 import { PhotoUpload } from '@/components/ui/photo-upload';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useDepartmentRequests, 
  useMyDepartmentRequests,
  useCreateDepartmentRequest,
  useDeleteDepartmentRequest 
} from '@/hooks/useDepartmentRequests';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const DepartmentRequestsPage = () => {
  const { profile, user } = useAuth();
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
   const [photoUrl, setPhotoUrl] = useState('');
  
  const { data: requests = [], isLoading: loadingRequests } = useDepartmentRequests();
  const { data: myRequests = [], isLoading: loadingMyRequests } = useMyDepartmentRequests();
  const createRequest = useCreateDepartmentRequest();
  const deleteRequest = useDeleteDepartmentRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }

    try {
      await createRequest.mutateAsync({
        title: title.trim(),
        author_name: authorName.trim() || undefined,
      });
      toast.success('Request submitted successfully!');
      setTitle('');
      setAuthorName('');
       setPhotoUrl('');
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequest.mutateAsync(id);
      toast.success('Request deleted');
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = (whatsappNumber: string, bookTitle: string) => {
    const message = `Hi, I saw your request for "${bookTitle}" on Boi Rajjo. I have this book available!`;
    window.open(`https://wa.me/${whatsappNumber.replace(/\\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Department Book Requests
          </h1>
          <p className="text-muted-foreground">
            Request books from seniors/juniors in your department or help others by sharing books you have
          </p>
        </div>

        <Tabs defaultValue="request" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request">Request A Book</TabsTrigger>
            <TabsTrigger value="browse">Requested Books</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Request A Book To Seniors/Juniors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter book title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author Name (Optional)</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>
                   <div className="space-y-2">
                     <Label>Book Photo (Optional)</Label>
                     <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
                   </div>
                  <Button type="submit" className="w-full" disabled={createRequest.isPending}>
                    {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* My Requests */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">My Requests</h2>
              {loadingMyRequests ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : myRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-muted-foreground">
                    You haven't made any requests yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{request.title}</h3>
                            {request.author_name && (
                              <p className="text-sm text-muted-foreground">by {request.author_name}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(request.id)}
                            disabled={deleteRequest.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Books Requested in Your Department
              </h2>
              <p className="text-sm text-muted-foreground">
                If you have any of these books, contact the requester to help them out!
              </p>
            </div>

            {loadingRequests ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No book requests in your department yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          {request.author_name && (
                            <p className="text-sm text-muted-foreground">by {request.author_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium">{request.profile?.name}</span>
                            <span className="text-xs text-muted-foreground">
                              • {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {request.user_id !== user?.id && request.profile && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCall(request.profile!.phone_number)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                            {request.profile.whatsapp_number && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleWhatsApp(request.profile!.whatsapp_number!, request.title)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DepartmentRequestsPage;
