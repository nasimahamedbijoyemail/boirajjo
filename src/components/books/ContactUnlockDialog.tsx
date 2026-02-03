import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Phone, MessageCircle, Copy } from 'lucide-react';
import { useCreateContactUnlock, useContactUnlockForBook } from '@/hooks/useContactUnlock';
import { BKASH_NUMBER } from '@/types/shop';
import { toast } from 'sonner';

interface ContactUnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  sellerName?: string;
}

export const ContactUnlockDialog = ({
  open,
  onOpenChange,
  bookId,
  bookTitle,
  bookPrice,
  sellerPhone,
  sellerWhatsapp,
  sellerName,
}: ContactUnlockDialogProps) => {
  const { data: existingPayment, isLoading: checkingPayment } = useContactUnlockForBook(bookId);
  const createPayment = useCreateContactUnlock();

  const [bkashNumber, setBkashNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const unlockFee = bookPrice >= 500 ? 20 : 10;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    toast.success('bKash number copied!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bkashNumber || bkashNumber.length < 11) {
      toast.error('Please enter a valid bKash number');
      return;
    }

    try {
      await createPayment.mutateAsync({
        book_id: bookId,
        amount: unlockFee,
        bkash_number: bkashNumber,
      });
      setSubmitted(true);
      toast.success('Payment submitted for verification!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment');
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const phone = phoneNumber.replace(/\D/g, '');
    return phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;
  };

  const handleWhatsAppClick = () => {
    if (!sellerWhatsapp && !sellerPhone) return;
    const number = sellerWhatsapp || sellerPhone || '';
    const message = encodeURIComponent(
      `Hi, I saw your book "${bookTitle}" on Boi Rajjo. Is it still available?`
    );
    window.open(`https://wa.me/${formatPhoneNumber(number)}?text=${message}`, '_blank');
    onOpenChange(false);
  };

  const handleCallClick = () => {
    if (!sellerPhone) return;
    window.open(`tel:${sellerPhone}`, '_self');
    onOpenChange(false);
  };

  if (checkingPayment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-primary">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If payment is approved, show seller contact
  if (existingPayment?.status === 'approved') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Seller Contact Unlocked
            </DialogTitle>
          </DialogHeader>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <p className="font-medium">{sellerName}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{sellerPhone}</span>
              </div>
              {sellerWhatsapp && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{sellerWhatsapp}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {(sellerWhatsapp || sellerPhone) && (
              <Button variant="whatsapp" className="flex-1" onClick={handleWhatsAppClick}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
            {sellerPhone && (
              <Button variant="outline" className="flex-1" onClick={handleCallClick}>
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If payment is pending
  if (existingPayment?.status === 'pending' || submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Payment Pending Verification
            </DialogTitle>
          </DialogHeader>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 space-y-2">
              <p className="font-medium">Your payment is being verified</p>
              <p className="text-sm text-muted-foreground">
                Transaction: {existingPayment?.transaction_number}
              </p>
              <p className="text-sm text-muted-foreground">
                Amount: ৳{existingPayment?.amount || unlockFee}
              </p>
              <p className="text-sm text-muted-foreground">
                bKash Number: {existingPayment?.bkash_number || bkashNumber}
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground text-center">
            Admin will verify your payment shortly. Please wait.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // If payment was rejected
  if (existingPayment?.status === 'rejected') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Payment Rejected
            </DialogTitle>
          </DialogHeader>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm">
                Your payment could not be verified. Please try again with correct details.
              </p>
              {existingPayment.admin_notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  Note: {existingPayment.admin_notes}
                </p>
              )}
            </CardContent>
          </Card>

          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Show payment form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Seller Contact</DialogTitle>
          <DialogDescription>
            Pay via bKash to view the seller's contact information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Book Price:</span>
                <span className="font-medium">৳{bookPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unlock Fee:</span>
                <Badge variant="secondary" className="text-lg">৳{unlockFee}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Send ৳{unlockFee} to bKash:</span>
                <Button variant="ghost" size="sm" onClick={handleCopyNumber}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-2xl font-bold text-pink-600">{BKASH_NUMBER}</p>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Your bKash Number (the one you sent from)</Label>
              <Input
                placeholder="01XXXXXXXXX"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
              />
            </div>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <p className="text-sm text-green-800">
                  <strong>Refund Policy:</strong> If you don't buy the book, the ৳{unlockFee} you are paying will be 100% refunded.
                </p>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={createPayment.isPending}>
              {createPayment.isPending ? 'Submitting...' : `Submit Payment (৳${unlockFee})`}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
