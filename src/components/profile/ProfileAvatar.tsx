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
  size?: 'sm' | 'lg';
}

export const ProfileAvatar = ({ photoUrl, name, editable = false, size = 'lg' }: ProfileAvatarProps) => {
  const { user, updateProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = size === 'lg' 
    ? 'h-16 w-16 sm:h-20 sm:w-20' 
    : 'h-12 w-12 sm:h-16 sm:w-16';
  
  const iconSize = size === 'lg' 
    ? 'h-8 w-8 sm:h-10 sm:w-10' 
    : 'h-6 w-6 sm:h-8 sm:w-8';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
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

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      // Update profile
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
    <div className="relative group">
      <div className={cn(
        sizeClasses,
        'rounded-full border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden',
        photoUrl ? 'bg-muted' : 'bg-primary/10'
      )}>
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <User className={cn(iconSize, 'text-primary')} />
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center',
              'bg-foreground/0 group-hover:bg-foreground/40 transition-colors cursor-pointer',
              uploading && 'bg-foreground/40'
            )}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </>
      )}
    </div>
  );
};
