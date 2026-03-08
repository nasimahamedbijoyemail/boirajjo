import * as React from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/image-compression';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  bucket?: string;
  folder?: string;
}

export const PhotoUpload = ({
  value,
  onChange,
  className,
  bucket = 'uploads',
  folder,
}: PhotoUploadProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const { user } = useAuth();

  const uploadFile = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload photos');
      return;
    }

    setUploading(true);
    try {
      // Compress image client-side
      const originalSize = file.size;
      const compressed = await compressImage(file);
      const compressedSize = compressed.size;
      console.log(
        `📸 Image compression: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (${((1 - compressedSize / originalSize) * 100).toFixed(0)}% reduction)`
      );
      
      // Build storage path: {userId}/{folder}/{timestamp}-{filename}
      const ext = compressed.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const basePath = folder ? `${user.id}/${folder}` : user.id;
      const filePath = `${basePath}/${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressed, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    await uploadFile(file);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              'flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30',
              uploading && 'pointer-events-none opacity-60'
            )}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <>
                <Camera className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Upload</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Or paste image URL"
            value={value.startsWith('blob:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground">
            {uploading ? 'Compressing & uploading...' : 'Upload from device or paste URL'}
          </p>
        </div>
      </div>
    </div>
  );
};
