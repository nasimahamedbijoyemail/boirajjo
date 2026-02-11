import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, MapPin, Building2, Calendar, Edit2, Save, X, MessageCircle, Bell, Settings, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Institution, InstitutionType, COLLEGE_DIVISIONS, SCHOOL_CLASSES } from '@/types/database';
import { useInstitutions, useDepartments } from '@/hooks/useInstitutions';
import { useAcademicDepartments } from '@/hooks/useAcademicDepartments';
import { toast } from 'sonner';
import UserNotifications from '@/components/notifications/UserNotifications';
import { useUnreadNotificationsCount } from '@/hooks/useUserNotifications';

const ProfilePage = () => {
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [editData, setEditData] = useState({
    phone_number: '',
    whatsapp_number: '',
    institution_type: '' as InstitutionType | '',
    institution_id: '',
    subcategory: '',
    department_id: '',
    academic_department_id: '',
  });

  const { data: institution } = useQuery({
    queryKey: ['institution', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', profile.institution_id)
        .single();
      if (error) throw error;
      return data as Institution;
    },
    enabled: !!profile?.institution_id,
  });

  // Fetch for editing
  const { data: institutions } = useInstitutions(editData.institution_type || undefined);
  const { data: nuColleges } = useDepartments(
    editData.institution_type === 'national_university' ? editData.institution_id : undefined
  );
  const { data: academicDepartments } = useAcademicDepartments();

  const institutionTypeLabels: Record<string, string> = {
    university: 'University',
    college: 'College',
    school: 'School',
    national_university: 'National University',
  };

  const startEditing = () => {
    setEditData({
      phone_number: profile?.phone_number || '',
      whatsapp_number: profile?.whatsapp_number || '',
      institution_type: profile?.institution_type || '',
      institution_id: profile?.institution_id || '',
      subcategory: profile?.subcategory || '',
      department_id: profile?.department_id || '',
      academic_department_id: profile?.academic_department_id || '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    
    const updateData: Record<string, unknown> = {
      phone_number: editData.phone_number,
      whatsapp_number: editData.whatsapp_number || null,
      institution_type: editData.institution_type,
      institution_id: editData.institution_id,
    };

    if (editData.institution_type === 'national_university') {
      updateData.department_id = editData.department_id;
      updateData.academic_department_id = editData.academic_department_id;
      updateData.subcategory = academicDepartments?.find(d => d.id === editData.academic_department_id)?.name || null;
    } else if (editData.institution_type === 'university') {
      updateData.academic_department_id = editData.academic_department_id;
      updateData.subcategory = academicDepartments?.find(d => d.id === editData.academic_department_id)?.name || null;
    } else {
      updateData.subcategory = editData.subcategory;
      updateData.department_id = null;
      updateData.academic_department_id = null;
    }

    const { error } = await updateProfile(updateData);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      await refreshProfile();
      setIsEditing(false);
    }
    setSaving(false);
  };

  // Logic for Account Deletion Request
  const handleRequestDeletion = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to request account deletion? This action cannot be undone and an admin will process it."
    );

    if (confirmDelete && profile?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          deletion_requested: true, 
          deletion_requested_at: new Date().toISOString() 
        })
        .eq('id', profile.id);

      if (error) {
        toast.error("Error: " + error.message);
      } else {
        toast.success("Deletion request sent to Admin.");
        await refreshProfile();
      }
    }
  };

  // Prepare options for selects
  const institutionOptions = useMemo(() => {
    return institutions?.map((inst) => ({
      value: inst.id,
      label: inst.name,
    })) || [];
  }, [institutions]);

  const nuCollegeOptions = useMemo(() => {
    return nuColleges?.map((college) => ({
      value: college.id,
      label: college.name,
    })) || [];
  }, [nuColleges]);

  const academicDepartmentOptions = useMemo(() => {
    return academicDepartments?.map((dept) => ({
      value: dept.id,
      label: dept.name,
      group: dept.category,
    })) || [];
  }, [academicDepartments]);

  const getSubcategoryOptions = () => {
    if (editData.institution_type === 'college') {
      return COLLEGE_DIVISIONS.map((d) => ({ value: d, label: d }));
    }
    if (editData.institution_type === 'school') {
      return SCHOOL_CLASSES.map((c) => ({ value: c, label: `Class ${c}` }));
    }
    return [];
  };

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">My Profile</h1>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex items-center justify-end mb-4">
              {!isEditing ? (
                <Button variant="outline" onClick={startEditing}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={saveChanges} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{profile?.name}</CardTitle>
                    <Badge variant="institution" className="mt-1">
                      {institution?.name || 'No institution selected'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Contact Number *</Label>
                      <Input
                        value={editData.phone_number}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number (Optional)</Label>
                      <Input
                        value={editData.whatsapp_number}
                        onChange={(e) => setEditData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                        placeholder="01XXXXXXXXX (if different)"
                      />
                      <p className="text-xs text-muted-foreground">Leave empty if same as contact number</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Institution Type</Label>
                      <Select
                        value={editData.institution_type}
                        onValueChange={(value) => setEditData(prev => ({
                          ...prev,
                          institution_type: value as InstitutionType,
                          institution_id: '',
                          subcategory: '',
                          department_id: '',
                          academic_department_id: '',
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national_university">National University</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editData.institution_type && (
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <SearchableSelect
                          options={institutionOptions}
                          value={editData.institution_id}
                          onValueChange={(value) => setEditData(prev => ({
                            ...prev,
                            institution_id: value,
                            subcategory: '',
                            department_id: '',
                            academic_department_id: '',
                          }))}
                          placeholder="Search institution..."
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Number</p>
                        <p className="font-medium">{profile?.phone_number}</p>
                      </div>
                    </div>
                    {profile?.whatsapp_number && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">WhatsApp Number</p>
                          <p className="font-medium">{profile.whatsapp_number}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Institution Type</p>
                        <p className="font-medium">{profile?.institution_type ? institutionTypeLabels[profile.institution_type] : '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-6 border-red-100 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-900 text-sm md:text-base">Delete Account</p>
                    <p className="text-xs text-red-600">This will notify the admin to permanently remove your data.</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleRequestDeletion}
                    disabled={profile?.deletion_requested}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {profile?.deletion_requested ? 'Request Sent' : 'Delete Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <UserNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
