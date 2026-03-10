'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createActivity, type CreateActivityRequest } from '@/lib/api/activities';

const activitySchema = z.object({
  type: z.enum(['NOTE', 'EMAIL', 'CALL', 'MEETING', 'TASK']),
  subject: z.string().min(1, 'Subject is required').max(500),
  body: z.string().optional(),
  duration: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  dueAt: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  ticketId?: string;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  onCreated,
  contactId,
  companyId,
  dealId,
  ticketId,
}: ActivityFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: 'NOTE',
      subject: '',
      body: '',
    },
  });

  const activityType = form.watch('type');

  async function onSubmit(values: ActivityFormValues) {
    setSubmitting(true);
    try {
      const payload: CreateActivityRequest = {
        type: values.type,
        subject: values.subject,
        body: values.body || undefined,
        contactId,
        companyId,
        dealId,
        ticketId,
      };

      if (values.type === 'CALL' && values.duration) {
        payload.duration = parseInt(values.duration, 10);
      }
      if (values.type === 'MEETING') {
        if (values.startAt) payload.startAt = new Date(values.startAt).toISOString();
        if (values.endAt) payload.endAt = new Date(values.endAt).toISOString();
      }
      if (values.type === 'TASK' && values.dueAt) {
        payload.dueAt = new Date(values.dueAt).toISOString();
      }

      await createActivity(payload);
      toast.success('Activity created');
      form.reset();
      onOpenChange(false);
      onCreated?.();
    } catch {
      toast.error('Failed to create activity');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={activityType}
              onValueChange={(value) => form.setValue('type', value as ActivityFormValues['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOTE">Note</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="CALL">Call</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...form.register('subject')} placeholder="Activity subject" />
            {form.formState.errors.subject && (
              <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <textarea
              id="body"
              {...form.register('body')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Details..."
            />
          </div>

          {activityType === 'CALL' && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input id="duration" type="number" min={0} {...form.register('duration')} placeholder="300" />
            </div>
          )}

          {activityType === 'MEETING' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAt">Start</Label>
                <Input id="startAt" type="datetime-local" {...form.register('startAt')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endAt">End</Label>
                <Input id="endAt" type="datetime-local" {...form.register('endAt')} />
              </div>
            </div>
          )}

          {activityType === 'TASK' && (
            <div className="space-y-2">
              <Label htmlFor="dueAt">Due Date</Label>
              <Input id="dueAt" type="datetime-local" {...form.register('dueAt')} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
