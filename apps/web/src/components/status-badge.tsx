import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

const variantStyles: Record<StatusVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-700 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  muted: 'bg-muted text-muted-foreground border-border',
};

// Lifecycle stage mappings
const lifecycleStageVariants: Record<string, StatusVariant> = {
  SUBSCRIBER: 'info',
  LEAD: 'warning',
  OPPORTUNITY: 'default',
  CUSTOMER: 'success',
};

// Ticket status mappings
const ticketStatusVariants: Record<string, StatusVariant> = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  WAITING: 'muted',
  RESOLVED: 'success',
  CLOSED: 'muted',
};

// Ticket priority mappings
const ticketPriorityVariants: Record<string, StatusVariant> = {
  LOW: 'muted',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

// Deal stage mappings (won/lost)
const dealStatusVariants: Record<string, StatusVariant> = {
  WON: 'success',
  LOST: 'danger',
  ACTIVE: 'default',
};

// Campaign status mappings
const campaignStatusVariants: Record<string, StatusVariant> = {
  DRAFT: 'muted',
  SCHEDULED: 'info',
  SENDING: 'warning',
  SENT: 'success',
  CANCELLED: 'danger',
};

const allMappings: Record<string, Record<string, StatusVariant>> = {
  lifecycle: lifecycleStageVariants,
  ticketStatus: ticketStatusVariants,
  ticketPriority: ticketPriorityVariants,
  dealStatus: dealStatusVariants,
  campaignStatus: campaignStatusVariants,
};

interface StatusBadgeProps {
  status: string;
  type?: keyof typeof allMappings;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({
  status,
  type,
  variant: explicitVariant,
  className,
}: StatusBadgeProps) {
  let resolvedVariant: StatusVariant = 'default';

  if (explicitVariant) {
    resolvedVariant = explicitVariant;
  } else if (type && allMappings[type]) {
    resolvedVariant = allMappings[type][status] || 'default';
  }

  const label = status.replace(/_/g, ' ');

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium capitalize',
        variantStyles[resolvedVariant],
        className,
      )}
    >
      {label.toLowerCase()}
    </Badge>
  );
}
