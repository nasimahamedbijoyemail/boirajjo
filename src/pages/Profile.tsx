import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Phone, Building2, Calendar, Edit2, Save, X, MessageCircle, Bell, Settings, Trash2, GraduationCap, BookOpen, Mail } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Institution, InstitutionType, COLLEGE_DIVISIONS, SCHOOL_CLASSES } from '@/types/database';
import { useInstitutions, useDepartments } from '@/hooks/useInstitutions';
import { useAcademicDepartments } from '@/hooks/useAcademicDepartments';
import { toast } from 'sonner';
import UserNotifications from '@/components/notifications/UserNotifications';
import { useUnreadNotificationsCount } from '@/hooks/useUserNotifications';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileInfoRow = ({ icon: Icon, label, value, index = 0 }: { icon: React.ElementType; label: string; value: string; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.25 }}
    className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60 active:bg-muted/70"
  >
    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm sm:text-base truncate">{value}</p>
    </div>
  </motion.div>
);

const ProfilePage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'notifications' ? 'notifications' : 'profile';
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

  // Fetch department name for display
  const { data: department } = useQuery({
    queryKey: ['department', profile?.department_id],
    queryFn: async () => {
      if (!profile?.department_id) return null;
      const { data, error } = await supabase
        .from('departments')
        .select('name')
        .eq('id', profile.department_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.department_id,
  });

  // Fetch academic department name for display
  const { data: academicDept } = useQuery({
    queryKey: ['academic_department', profile?.academic_department_id],
    queryFn: async () => {
      if (!profile?.academic_department_id) return null;
      const { data, error } = await supabase
        .from('academic_departments')
        .select('name')
        .eq('id', profile.academic_department_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.academic_department_id,
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
    if (!editData.phone_number.trim()) {
      toast.error('Contact number is required');
      return;
    }

    setSaving(true);
    
    const updateData: Record<string, unknown> = {
      phone_number: editData.phone_number.trim(),
      whatsapp_number: editData.whatsapp_number.trim() || null,
      institution_type: editData.institution_type || null,
      institution_id: editData.institution_id || null,
    };

    if (editData.institution_type === 'national_university') {
      updateData.department_id = editData.department_id || null;
      updateData.academic_department_id = editData.academic_department_id || null;
      updateData.subcategory = academicDepartments?.find(d => d.id === editData.academic_department_id)?.name || null;
    } else if (editData.institution_type === 'university') {
      updateData.academic_department_id = editData.academic_department_id || null;
      updateData.subcategory = academicDepartments?.find(d => d.id === editData.academic_department_id)?.name || null;
      updateData.department_id = null;
    } else {
      updateData.subcategory = editData.subcategory || null;
      updateData.department_id = null;
      updateData.academic_department_id = null;
    }

    const { error } = await updateProfile(updateData);
    
    if (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } else {
      toast.success('Profile updated successfully');
      await refreshProfile();
      setIsEditing(false);
    }
    setSaving(false);
  };

  // Fixed: Use updateProfile helper which correctly uses .eq('user_id', user.id)
  const handleRequestDeletion = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to request account deletion? This action cannot be undone and an admin will process it."
    );

    if (confirmDelete && profile?.id) {
      const { error } = await updateProfile({ 
        deletion_requested: true, 
        deletion_requested_at: new Date().toISOString() 
      });

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

  // Build view-mode detail label
  const getSubcategoryLabel = () => {
    if (!profile?.institution_type) return null;
    if (profile.institution_type === 'national_university' || profile.institution_type === 'university') {
      return academicDept?.name || profile.subcategory || null;
    }
    if (profile.institution_type === 'college') return profile.subcategory ? `Division: ${profile.subcategory}` : null;
    if (profile.institution_type === 'school') return profile.subcategory ? `Class ${profile.subcategory}` : null;
    return null;
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-2xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6">My Profile</h1>

        <Tabs defaultValue={defaultTab} className="space-y-3 sm:space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile" className="flex-1 sm:flex-none">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 sm:flex-none flex items-center gap-1.5 sm:gap-2">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-0.5 h-5 min-w-5 px-1 flex items-center justify-center text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex items-center justify-end mb-3 sm:mb-4">
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveChanges} disabled={saving} className="gradient-primary text-primary-foreground">
                      <Save className="h-4 w-4 mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Card className="shadow-card overflow-hidden">
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3 sm:gap-4">
                  <ProfileAvatar 
                    photoUrl={profile?.photo_url || null} 
                    name={profile?.name || ''} 
                    editable={isEditing}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl truncate">{profile?.name}</CardTitle>
                    <Badge variant="institution" className="mt-1 text-xs sm:text-sm max-w-full truncate">
                      {institution?.name || 'No institution selected'}
                    </Badge>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-1">Tap photo to change</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Contact Number *</Label>
                        <Input
                          value={editData.phone_number}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone_number: e.target.value }))}
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">WhatsApp Number (Optional)</Label>
                        <Input
                          value={editData.whatsapp_number}
                          onChange={(e) => setEditData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                          placeholder="01XXXXXXXXX (if different)"
                        />
                        <p className="text-xs text-muted-foreground">Leave empty if same as contact number</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Institution Type</Label>
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

                      <AnimatePresence>
                        {editData.institution_type && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Institution</Label>
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

                            {/* NU: College under National University */}
                            {editData.institution_type === 'national_university' && editData.institution_id && (
                              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <Label className="text-sm font-medium">College</Label>
                                <SearchableSelect
                                  options={nuCollegeOptions}
                                  value={editData.department_id}
                                  onValueChange={(value) => setEditData(prev => ({
                                    ...prev,
                                    department_id: value,
                                  }))}
                                  placeholder="Search college..."
                                />
                              </motion.div>
                            )}

                            {/* Academic Department for University and NU */}
                            {(editData.institution_type === 'university' || editData.institution_type === 'national_university') && editData.institution_id && (
                              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <Label className="text-sm font-medium">Academic Department</Label>
                                <SearchableSelect
                                  options={academicDepartmentOptions}
                                  value={editData.academic_department_id}
                                  onValueChange={(value) => setEditData(prev => ({
                                    ...prev,
                                    academic_department_id: value,
                                  }))}
                                  placeholder="Search department..."
                                />
                              </motion.div>
                            )}

                            {/* College Division or School Class */}
                            {(editData.institution_type === 'college' || editData.institution_type === 'school') && editData.institution_id && (
                              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <Label className="text-sm font-medium">{editData.institution_type === 'college' ? 'Division' : 'Class'}</Label>
                                <Select
                                  value={editData.subcategory}
                                  onValueChange={(value) => setEditData(prev => ({ ...prev, subcategory: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${editData.institution_type === 'college' ? 'division' : 'class'}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getSubcategoryOptions().map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="viewing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid gap-2.5 sm:gap-3"
                    >
                      {user?.email && (
                        <ProfileInfoRow icon={Mail} label="Email" value={user.email} index={0} />
                      )}
                      <ProfileInfoRow icon={Phone} label="Contact Number" value={profile?.phone_number || '-'} index={1} />
                      {profile?.whatsapp_number && (
                        <ProfileInfoRow icon={MessageCircle} label="WhatsApp Number" value={profile.whatsapp_number} index={2} />
                      )}
                      <ProfileInfoRow
                        icon={Building2}
                        label="Institution Type"
                        value={profile?.institution_type ? institutionTypeLabels[profile.institution_type] : '-'}
                        index={3}
                      />
                      {institution?.name && (
                        <ProfileInfoRow icon={GraduationCap} label="Institution" value={institution.name} index={4} />
                      )}
                      {/* Show college for NU users */}
                      {profile?.institution_type === 'national_university' && department?.name && (
                        <ProfileInfoRow icon={GraduationCap} label="College" value={department.name} index={5} />
                      )}
                      {/* Show academic department / division / class */}
                      {getSubcategoryLabel() && (
                        <ProfileInfoRow
                          icon={BookOpen}
                          label={
                            profile?.institution_type === 'university' || profile?.institution_type === 'national_university'
                              ? 'Academic Department'
                              : profile?.institution_type === 'college' ? 'Division' : 'Class'
                          }
                          value={getSubcategoryLabel()!}
                          index={6}
                        />
                      )}
                      <ProfileInfoRow
                        icon={Calendar}
                        label="Member Since"
                        value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                        index={7}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-4 sm:mt-6 border-destructive/20 bg-destructive/5">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                <CardTitle className="text-destructive flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-destructive text-sm">Delete Account</p>
                    <p className="text-xs text-muted-foreground">This will notify the admin to permanently remove your data.</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full sm:w-auto shrink-0"
                    onClick={handleRequestDeletion}
                    disabled={profile?.deletion_requested}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
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
