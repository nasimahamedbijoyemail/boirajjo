import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserX, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

const AdminDeletionRequestsTab = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-deletion-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('deletion_requested', true)
        .order('deletion_requested_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleProcessDeletion = async (userId: string) => {
    const confirm = window.confirm(
      "EXTREME DANGER: This will permanently remove this user's profile. This action is irreversible. Proceed?"
    );
    
    if (!confirm) return;

    // Note: In a real app, you might want a Edge Function to handle auth.users deletion.
    // This removes the profile record.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      toast.error("Error deleting profile: " + error.message);
    } else {
      toast.success("User profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-deletion-requests'] });
    }
  };

  const handleCancelRequest = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        deletion_requested: false, 
        deletion_requested_at: null 
      })
      .eq('id', userId);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Deletion request cancelled");
      queryClient.invalidateQueries({ queryKey: ['admin-deletion-requests'] });
    }
  };

  if (isLoading) return <div className="p-4">Loading requests...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm font-medium">
          Users listed here have requested permanent account deletion.
        </p>
      </div>

      {requests?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No pending deletion requests.
          </CardContent>
        </Card>
      ) : (
        requests?.map((user) => (
          <Card key={user.id} className="border-red-100">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <UserX className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                  </div>
                </div>
                <Badge variant="destructive">
                  Requested {new Date(user.deletion_requested_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCancelRequest(user.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleProcessDeletion(user.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirm Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminDeletionRequestsTab;
