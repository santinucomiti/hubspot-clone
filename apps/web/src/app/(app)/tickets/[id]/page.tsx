'use client';

import { use } from 'react';
import { TicketDetail } from '@/features/service/ticket-detail';

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = use(params);
  return <TicketDetail ticketId={id} />;
}
