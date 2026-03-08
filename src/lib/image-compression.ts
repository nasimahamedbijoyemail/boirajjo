/**
 * Client-side image compression before uploading to storage.
 * Resizes to max dimensions and compresses to JPEG/WebP.
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  // Skip compression for small files (< 200KB)
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Use WebP if supported, otherwise JPEG
          const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${ext}`),
            { type: blob.type }
          );

          // Only use compressed if it's actually smaller
          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}
