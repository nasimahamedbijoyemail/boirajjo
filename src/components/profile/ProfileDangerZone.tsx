import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileDangerZoneProps {
  deletionRequested: boolean | null | undefined;
  onRequestDeletion: () => void;
}

export const ProfileDangerZone = ({ deletionRequested, onRequestDeletion }: ProfileDangerZoneProps) => (
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
                disabled={!!deletionRequested}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {deletionRequested ? 'Request Sent' : 'Delete Request'}
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
                  onClick={onRequestDeletion}
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
);
