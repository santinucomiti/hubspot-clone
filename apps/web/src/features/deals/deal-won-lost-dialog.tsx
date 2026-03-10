'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DealWonLostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'won' | 'lost';
  dealName: string;
  onConfirm: (reason?: string) => Promise<void>;
}

export function DealWonLostDialog({
  open,
  onOpenChange,
  type,
  dealName,
  onConfirm,
}: DealWonLostDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isWon = type === 'won';

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(isWon ? undefined : reason || undefined);
      setReason('');
      onOpenChange(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isWon ? 'Mark Deal as Won' : 'Mark Deal as Lost'}
          </DialogTitle>
          <DialogDescription>
            {isWon
              ? `Congratulations! "${dealName}" will be marked as won.`
              : `"${dealName}" will be marked as lost. Optionally provide a reason.`}
          </DialogDescription>
        </DialogHeader>

        {!isWon && (
          <div className="space-y-2 py-4">
            <Label htmlFor="lostReason">Reason for losing</Label>
            <Input
              id="lostReason"
              placeholder="e.g. Went with competitor, Budget constraints..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={isWon ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? 'Saving...'
              : isWon
                ? 'Mark as Won'
                : 'Mark as Lost'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
