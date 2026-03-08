import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Save, X, Bell, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Institution, InstitutionType } from '@/types/database';
import { useInstitutions, useDepartments } from '@/hooks/useInstitutions';
import { useAcademicDepartments } from '@/hooks/useAcademicDepartments';
import { toast } from 'sonner';
import UserNotifications from '@/components/notifications/UserNotifications';
import { useUnreadNotificationsCount } from '@/hooks/useUserNotifications';
import { AnimatePresence, motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';
import { BD_PHONE_REGEX } from '@/lib/validators';

import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditForm, ProfileEditData } from '@/components/profile/ProfileEditForm';
import { ProfileInfoList } from '@/components/profile/ProfileInfoList';
import { ProfileDangerZone } from '@/components/profile/ProfileDangerZone';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';

const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  university: 'University',
  college: 'College',
  school: 'School',
  national_university: 'National University',
};

const ProfilePage = () => {
  const { user, profile, updateProfile, refreshProfile, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'notifications' ? 'notifications' : 'profile';
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editData, setEditData] = useState<ProfileEditData>({
    name: '',
    phone_number: '',
    whatsapp_number: '',
    institution_type: '',
    institution_id: '',
    subcategory: '',
    department_id: '',
    academic_department_id: '',
  });

  const { data: institution } = useQuery({
    queryKey: ['institution', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      const { data, error } = await supabase.from('institutions').select('*').eq('id', profile.institution_id).maybeSingle();
      if (error) throw error;
      return data as Institution | null;
    },
    enabled: !!profile?.institution_id,
  });

  const { data: department } = useQuery({
    queryKey: ['department', profile?.department_id],
    queryFn: async () => {
      if (!profile?.department_id) return null;
      const { data, error } = await supabase.from('departments').select('name').eq('id', profile.department_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.department_id,
  });

  const { data: academicDept } = useQuery({
    queryKey: ['academic_department', profile?.academic_department_id],
    queryFn: async () => {
      if (!profile?.academic_department_id) return null;
      const { data, error } = await supabase.from('academic_departments').select('name').eq('id', profile.academic_department_id).maybeSingle();
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
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const startEditing = () => {
    setEditData({
      name: profile?.name || '',
      phone_number: profile?.phone_number || '',
      whatsapp_number: profile?.whatsapp_number || '',
      institution_type: (profile?.institution_type as InstitutionType) || '',
      institution_id: profile?.institution_id || '',
      subcategory: profile?.subcategory || '',
      department_id: profile?.department_id || '',
      academic_department_id: profile?.academic_department_id || '',
    });
    setIsEditing(true);
  };

  const saveChanges = async () => {
    if (!editData.name.trim()) { toast.error('Name is required'); return; }
    if (!editData.phone_number.trim()) { toast.error('Contact number is required'); return; }
    if (!BD_PHONE_REGEX.test(editData.phone_number.trim())) { toast.error('Enter a valid BD number (e.g. 01712345678)'); return; }
    if (editData.whatsapp_number.trim() && !BD_PHONE_REGEX.test(editData.whatsapp_number.trim())) { toast.error('Enter a valid WhatsApp number'); return; }

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
      updateData.subcategory = academicDepartments?.find((d) => d.id === editData.academic_department_id)?.name || null;
    } else if (editData.institution_type === 'university') {
      updateData.academic_department_id = editData.academic_department_id || null;
      updateData.subcategory = academicDepartments?.find((d) => d.id === editData.academic_department_id)?.name || null;
      updateData.department_id = null;
    } else {
      updateData.subcategory = editData.subcategory || null;
      updateData.department_id = null;
      updateData.academic_department_id = null;
    }

    const { error } = await updateProfile(updateData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully! ✨');
      await refreshProfile();
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleRequestDeletion = async () => {
    if (!profile?.id) return;
    const { error } = await updateProfile({ deletion_requested: true, deletion_requested_at: new Date().toISOString() });
    if (error) { toast.error('Error: ' + error.message); }
    else { toast.success('Deletion request sent to Admin.'); await refreshProfile(); }
  };

  const getSubcategoryLabel = () => {
    if (!profile?.institution_type) return null;
    if (profile.institution_type === 'national_university' || profile.institution_type === 'university')
      return academicDept?.name || profile.subcategory || null;
    if (profile.institution_type === 'college') return profile.subcategory || null;
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
      <SEOHead title="My Profile" description="Manage your Boi Rajjo profile, institution, and contact details." path="/profile" />
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
            <Card className="overflow-hidden border-0 shadow-card">
              <ProfileHeader
                photoUrl={profile?.photo_url || null}
                name={profile?.name || ''}
                institutionName={institution?.name || null}
                isEditing={isEditing}
              />

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
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={saving} className="rounded-xl">
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
                    <ProfileEditForm
                      editData={editData}
                      setEditData={setEditData}
                      institutions={institutions}
                      nuColleges={nuColleges}
                      academicDepartments={academicDepartments}
                    />
                  ) : (
                    <ProfileInfoList
                      email={user?.email}
                      profile={profile}
                      institutionName={institution?.name || null}
                      departmentName={department?.name || null}
                      subcategoryLabel={getSubcategoryLabel()}
                      institutionTypeLabels={INSTITUTION_TYPE_LABELS}
                    />
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <ChangePasswordForm />

            <ProfileDangerZone
              deletionRequested={profile?.deletion_requested}
              onRequestDeletion={handleRequestDeletion}
            />
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
