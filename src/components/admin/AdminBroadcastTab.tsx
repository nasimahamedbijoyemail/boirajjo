import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Users, Building, GraduationCap, Store, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useInstitutions } from '@/hooks/useInstitutions';
import { useAllShops, useAllProfiles } from '@/hooks/useAdmin';
import { useQuery } from '@tanstack/react-query';
import { SearchableSelect } from '@/components/ui/searchable-select';

const AdminBroadcastTab = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<string>('all');
  const [targetInstitutionId, setTargetInstitutionId] = useState<string>('');
  const [targetDepartmentId, setTargetDepartmentId] = useState<string>('');
  const [targetShopId, setTargetShopId] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const { data: institutions = [] } = useInstitutions();
  const { data: shops = [] } = useAllShops();
  const { data: profiles = [] } = useAllProfiles();

  // Fetch departments for selected institution
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', targetInstitutionId],
    queryFn: async () => {
      if (!targetInstitutionId) return [];
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('institution_id', targetInstitutionId)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!targetInstitutionId,
  });

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both title and message',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-broadcast', {
        body: {
          title: title.trim(),
          message: message.trim(),
          target_type: targetType,
          target_institution_id: targetType === 'institution' || targetType === 'department' ? targetInstitutionId : null,
          target_department_id: targetType === 'department' ? targetDepartmentId : null,
          target_shop_id: targetType === 'shop' ? targetShopId : null,
          target_user_id: targetType === 'user' ? targetUserId : null,
        },
      });

      if (error) throw error;

      toast({
        title: 'Broadcast Sent',
        description: `Notification sent to ${data?.sent_count || 0} users`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setTargetType('all');
      setTargetInstitutionId('');
      setTargetDepartmentId('');
      setTargetShopId('');
      setTargetUserId('');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        title: 'Error',
        description: 'Failed to send broadcast',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const institutionOptions = institutions.map(i => ({ value: i.id, label: `${i.name} (${i.type})` }));
  const departmentOptions = departments.map(d => ({ value: d.id, label: d.name }));
  const shopOptions = shops.map(s => ({ value: s.id, label: s.name }));
  const userOptions = profiles.map(p => ({ value: p.user_id, label: `${p.name} (${p.phone_number})` }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Broadcast Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="institution">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Specific Institution
                    </div>
                  </SelectItem>
                  <SelectItem value="department">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Specific Department
                    </div>
                  </SelectItem>
                  <SelectItem value="shop">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Specific Shop
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Specific User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(targetType === 'institution' || targetType === 'department') && (
              <div className="space-y-2">
                <Label>Institution</Label>
                <SearchableSelect
                  options={institutionOptions}
                  value={targetInstitutionId}
                  onValueChange={setTargetInstitutionId}
                  placeholder="Select institution..."
                />
              </div>
            )}

            {targetType === 'department' && targetInstitutionId && (
              <div className="space-y-2">
                <Label>Department</Label>
                <SearchableSelect
                  options={departmentOptions}
                  value={targetDepartmentId}
                  onValueChange={setTargetDepartmentId}
                  placeholder="Select department..."
                />
              </div>
            )}

            {targetType === 'shop' && (
              <div className="space-y-2">
                <Label>Shop</Label>
                <SearchableSelect
                  options={shopOptions}
                  value={targetShopId}
                  onValueChange={setTargetShopId}
                  placeholder="Select shop..."
                />
              </div>
            )}

            {targetType === 'user' && (
              <div className="space-y-2">
                <Label>User</Label>
                <SearchableSelect
                  options={userOptions}
                  value={targetUserId}
                  onValueChange={setTargetUserId}
                  placeholder="Select user..."
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message..."
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSendBroadcast} 
            disabled={isSending || !title.trim() || !message.trim()}
            className="w-full"
          >
            {isSending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBroadcastTab;
