 import * as React from 'react';
 import { X, Camera } from 'lucide-react';
 import { Input } from '@/components/ui/input';
 import { cn } from '@/lib/utils';
 
 interface PhotoUploadProps {
   value: string;
   onChange: (url: string) => void;
   className?: string;
 }
 
 export const PhotoUpload = ({ value, onChange, className }: PhotoUploadProps) => {
   const fileInputRef = React.useRef<HTMLInputElement>(null);
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       // Create a local URL for preview
       const url = URL.createObjectURL(file);
       onChange(url);
     }
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
           <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30">
             <Camera className="h-6 w-6 text-muted-foreground" />
             <span className="text-xs text-muted-foreground mt-1">Upload</span>
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               className="hidden"
               onChange={handleFileChange}
             />
           </label>
         )}
         <div className="flex-1 space-y-1">
           <Input
             placeholder="Or paste image URL"
             value={value.startsWith('blob:') ? '' : value}
             onChange={(e) => onChange(e.target.value)}
           />
           <p className="text-xs text-muted-foreground">
             Upload from device or paste URL
           </p>
         </div>
       </div>
     </div>
   );
 };