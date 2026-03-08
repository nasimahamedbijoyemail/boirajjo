import { CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';

interface ProfileHeaderProps {
  photoUrl: string | null;
  name: string;
  institutionName: string | null;
  isEditing: boolean;
}

export const ProfileHeader = ({ photoUrl, name, institutionName, isEditing }: ProfileHeaderProps) => (
  <CardHeader className="relative p-0">
    <div className="h-28 sm:h-36 gradient-primary opacity-90 rounded-t-lg" />
    <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-4 sm:px-6 flex items-end gap-3 sm:gap-4">
      <div className="ring-4 ring-card rounded-full shadow-lg shrink-0">
        <ProfileAvatar
          photoUrl={photoUrl}
          name={name}
          editable={isEditing}
          size="lg"
        />
      </div>
      <div className="min-w-0 flex-1 pb-1 sm:pb-2">
        <h1 className="text-base sm:text-xl font-bold text-foreground truncate leading-tight">{name}</h1>
        <Badge variant="institution" className="text-[10px] sm:text-xs mt-0.5 max-w-[180px] sm:max-w-full truncate inline-block">
          {institutionName || 'No institution'}
        </Badge>
      </div>
    </div>
  </CardHeader>
);
