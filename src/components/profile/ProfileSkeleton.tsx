import { Skeleton } from '@/components/ui/skeleton';

export const ProfileSkeleton = () => (
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
