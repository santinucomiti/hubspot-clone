'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TicketForm } from '@/features/service/ticket-form';

export default function NewTicketPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Ticket
          </h1>
          <p className="text-sm text-muted-foreground">
            Open a new support ticket.
          </p>
        </div>
      </div>

      <TicketForm />
    </div>
  );
}
