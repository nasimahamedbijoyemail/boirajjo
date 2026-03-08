import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Phone, Building2, Calendar, Edit2, Save, X, MessageCircle, Bell, Trash2, GraduationCap, BookOpen, Mail, Shield, User } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

const ProfileInfoRow = ({ icon: Icon, label, value, index = 0 }: { icon: React.ElementType; label: string; value: string; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
    className="group flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 active:scale-[0.99]"
  >
    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-sm">
      <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-sm sm:text-[15px] text-foreground truncate mt-0.5">{value}</p>
    </div>
  </motion.div>
);

const ProfileSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4 p-6">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-56" />
      </div>
    </div>
    <div className="space-y-3 p-6 pt-0">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, profile, updateProfile, refreshProfile, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'notifications' ? 'notifications' : 'profile';
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    name: '',
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
      name: profile?.name || '',
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

  const cancelEditing = () => setIsEditing(false);

  const saveChanges = async () => {
    if (!editData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editData.phone_number.trim()) {
      toast.error('Contact number is required');
      return;
    }

    setSaving(true);
    
    const updateData: Record<string, unknown> = {
      name: editData.name.trim(),
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
      toast.success('Profile updated successfully! ✨');
      await refreshProfile();
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleRequestDeletion = async () => {
    if (!profile?.id) return;
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
  };

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

  const getSubcategoryLabel = () => {
    if (!profile?.institution_type) return null;
    if (profile.institution_type === 'national_university' || profile.institution_type === 'university') {
      return academicDept?.name || profile.subcategory || null;
    }
    if (profile.institution_type === 'college') return profile.subcategory ? `${profile.subcategory}` : null;
    if (profile.institution_type === 'school') return profile.subcategory ? `Class ${profile.subcategory}` : null;
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 py-4 sm:py-8 max-w-2xl mx-auto w-full">
          <ProfileSkeleton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-4 sm:py-8 max-w-2xl mx-auto w-full">
        <Tabs defaultValue={defaultTab} className="space-y-4 sm:space-y-6">
          <TabsList className="w-full grid grid-cols-2 h-11 sm:h-12 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="profile" className="rounded-lg text-sm sm:text-base font-semibold data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-1.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-sm sm:text-base font-semibold data-[state=active]:shadow-sm relative">
              <Bell className="h-4 w-4 mr-1.5" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 sm:space-y-5">
            {/* Profile Card */}
            <Card className="overflow-hidden border-0 shadow-card">
              {/* Premium Header */}
              <CardHeader className="relative p-0">
                <div className="h-28 sm:h-36 gradient-primary opacity-90 rounded-t-lg" />
                <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-4 sm:px-6 flex items-end gap-3 sm:gap-4">
                  <div className="ring-4 ring-card rounded-full shadow-lg shrink-0">
                    <ProfileAvatar 
                      photoUrl={profile?.photo_url || null} 
                      name={profile?.name || ''} 
                      editable={isEditing}
                      size="lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1 pb-1 sm:pb-2">
                    <h1 className="text-base sm:text-xl font-bold text-foreground truncate leading-tight">{profile?.name}</h1>
                    <Badge variant="institution" className="text-[10px] sm:text-xs mt-0.5 max-w-[180px] sm:max-w-full truncate inline-block">
                      {institution?.name || 'No institution'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-14 sm:pt-16 px-4 sm:px-6 pb-5 sm:pb-6">
                {/* Action buttons */}
                <div className="flex justify-end mb-4 sm:mb-5">
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.div key="edit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={startEditing} className="rounded-xl shadow-sm">
                          <Edit2 className="h-4 w-4 mr-1.5" />
                          Edit Profile
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div key="save" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving} className="rounded-xl">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveChanges} disabled={saving} className="gradient-primary text-primary-foreground rounded-xl shadow-sm">
                          <Save className="h-4 w-4 mr-1" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Name field */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Full Name *</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Contact Number *</Label>
                        <Input
                          value={editData.phone_number}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone_number: e.target.value }))}
                          placeholder="01XXXXXXXXX"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">WhatsApp Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                          value={editData.whatsapp_number}
                          onChange={(e) => setEditData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                          placeholder="01XXXXXXXXX"
                          className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground">Leave empty if same as contact number</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Institution Type</Label>
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
                          <SelectTrigger className="rounded-xl">
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
                              <Label className="text-sm font-semibold">Institution</Label>
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

                            {editData.institution_type === 'national_university' && editData.institution_id && (
                              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <Label className="text-sm font-semibold">College</Label>
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

                            {(editData.institution_type === 'university' || editData.institution_type === 'national_university') && editData.institution_id && (
                              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <Label className="text-sm font-semibold">Academic Department</Label>
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

                            {(editData.institution_type === 'college' || editData.institution_type === 'school') && editData.institution_id && (
                              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                <Label className="text-sm font-semibold">{editData.institution_type === 'college' ? 'Division' : 'Class'}</Label>
                                <Select
                                  value={editData.subcategory}
                                  onValueChange={(value) => setEditData(prev => ({ ...prev, subcategory: value }))}
                                >
                                  <SelectTrigger className="rounded-xl">
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
                      className="grid gap-3"
                    >
                      {user?.email && (
                        <ProfileInfoRow icon={Mail} label="Email" value={user.email} index={0} />
                      )}
                      <ProfileInfoRow icon={Phone} label="Contact Number" value={profile?.phone_number || '-'} index={1} />
                      {profile?.whatsapp_number && (
                        <ProfileInfoRow icon={MessageCircle} label="WhatsApp" value={profile.whatsapp_number} index={2} />
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
                      {profile?.institution_type === 'national_university' && department?.name && (
                        <ProfileInfoRow icon={GraduationCap} label="College" value={department.name} index={5} />
                      )}
                      {getSubcategoryLabel() && (
                        <ProfileInfoRow
                          icon={BookOpen}
                          label={
                            profile?.institution_type === 'university' || profile?.institution_type === 'national_university'
                              ? 'Department'
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border border-destructive/15 bg-destructive/[0.03]">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-destructive text-sm">Delete Account</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account and all data.</p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full sm:w-auto shrink-0 rounded-xl"
                          disabled={profile?.deletion_requested}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          {profile?.deletion_requested ? 'Request Sent' : 'Delete Request'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will send a deletion request to the admin. Your account and all associated data will be permanently removed. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRequestDeletion}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
