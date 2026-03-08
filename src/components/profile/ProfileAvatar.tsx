import { useState, useRef } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  photoUrl: string | null;
  name: string;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProfileAvatar = ({ photoUrl, name, editable = false, size = 'lg', className }: ProfileAvatarProps) => {
  const { user, updateProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12 sm:h-14 sm:w-14',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
  }[size];

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6 sm:h-7 sm:w-7',
    lg: 'h-8 w-8 sm:h-10 sm:w-10',
  }[size];

  const badgeSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-7 w-7 sm:h-8 sm:w-8',
  }[size];

  const badgeIconSize = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5 sm:h-4 sm:w-4',
  }[size];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await updateProfile({ photo_url: urlWithCacheBust });
      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Profile photo updated!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={editable ? () => fileInputRef.current?.click() : undefined}
        disabled={!editable || uploading}
        className={cn(
          sizeClasses,
          'rounded-full border-2 flex items-center justify-center shrink-0 overflow-hidden transition-all',
          photoUrl ? 'bg-muted border-border' : 'bg-primary/10 border-primary/20',
          editable && 'cursor-pointer active:scale-95 hover:border-primary/40',
          !editable && 'cursor-default'
        )}
      >
        {uploading ? (
          <Loader2 className={cn(iconSize, 'text-primary animate-spin')} />
        ) : photoUrl ? (
          <img 
            src={photoUrl} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <User className={cn(iconSize, 'text-primary')} />
        )}
      </button>

      {/* Always-visible camera badge for editable mode */}
      {editable && !uploading && (
        <div
          className={cn(
            badgeSize,
            'absolute -bottom-0.5 -right-0.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-card'
          )}
        >
          <Camera className={badgeIconSize} />
        </div>
      )}

      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      )}
    </div>
  );
};
