import { motion } from 'framer-motion';
import { Phone, Building2, Calendar, MessageCircle, GraduationCap, BookOpen, Mail } from 'lucide-react';
import { ProfileInfoRow } from './ProfileInfoRow';
import { Profile } from '@/types/database';

interface ProfileInfoListProps {
  email: string | undefined;
  profile: Profile | null;
  institutionName: string | null;
  departmentName: string | null;
  subcategoryLabel: string | null;
  institutionTypeLabels: Record<string, string>;
}

export const ProfileInfoList = ({
  email,
  profile,
  institutionName,
  departmentName,
  subcategoryLabel,
  institutionTypeLabels,
}: ProfileInfoListProps) => (
  <motion.div
    key="viewing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid gap-3"
  >
    {email && <ProfileInfoRow icon={Mail} label="Email" value={email} index={0} />}
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
    {institutionName && (
      <ProfileInfoRow icon={GraduationCap} label="Institution" value={institutionName} index={4} />
    )}
    {profile?.institution_type === 'national_university' && departmentName && (
      <ProfileInfoRow icon={GraduationCap} label="College" value={departmentName} index={5} />
    )}
    {subcategoryLabel && (
      <ProfileInfoRow
        icon={BookOpen}
        label={
          profile?.institution_type === 'university' || profile?.institution_type === 'national_university'
            ? 'Department'
            : profile?.institution_type === 'college'
              ? 'Division'
              : 'Class'
        }
        value={subcategoryLabel}
        index={6}
      />
    )}
    <ProfileInfoRow
      icon={Calendar}
      label="Member Since"
      value={
        profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '-'
      }
      index={7}
    />
  </motion.div>
);
