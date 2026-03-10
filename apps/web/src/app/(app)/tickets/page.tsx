'use client';

import Link from 'next/link';
import { Plus, Ticket } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketsTable } from '@/features/service/tickets-table';
import { ServiceDashboard } from '@/features/service/service-dashboard';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Manage support tickets and track customer issues."
        actions={
          <Button asChild>
            <Link href="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Create ticket
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <Ticket className="mr-2 h-4 w-4" />
            All Tickets
          </TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <TicketsTable />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-4">
          <ServiceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
