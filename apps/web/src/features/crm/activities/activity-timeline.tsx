'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  StickyNote,
  Mail,
  Phone,
  Users,
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { listActivities, type Activity } from '@/lib/api/activities';
import { cn } from '@/lib/utils';

const typeConfig: Record<Activity['type'], { icon: typeof StickyNote; label: string; color: string }> = {
  NOTE: { icon: StickyNote, label: 'Note', color: 'text-blue-500' },
  EMAIL: { icon: Mail, label: 'E-mail', color: 'text-purple-500' },
  CALL: { icon: Phone, label: 'Appel', color: 'text-green-500' },
  MEETING: { icon: Users, label: 'Réunion', color: 'text-orange-500' },
  TASK: { icon: CheckSquare, label: 'Tâche', color: 'text-yellow-600' },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ActivityTimelineProps {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  ticketId?: string;
  onAddActivity?: () => void;
}

export function ActivityTimeline({
  contactId,
  companyId,
  dealId,
  ticketId,
  onAddActivity,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const entityType = contactId ? 'contact' : companyId ? 'company' : dealId ? 'deal' : ticketId ? 'ticket' : undefined;
  const entityId = contactId || companyId || dealId || ticketId;

  const fetchActivities = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listActivities({
        entityType: entityType as 'contact' | 'company' | 'deal' | 'ticket',
        entityId,
        page,
        limit,
        sort: 'occurredAt:desc',
      });
      setActivities(result.data);
      setTotal(result.meta.total);
    } catch {
      setError('Échec du chargement des activités');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, page]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchActivities}>Réessayer</Button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <Clock className="h-8 w-8" />
        <p>Pas encore d'activités</p>
        {onAddActivity && (
          <Button variant="outline" size="sm" onClick={onAddActivity}>
            Ajouter une activité
          </Button>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityTimelineItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}

function ActivityTimelineItem({ activity }: { activity: Activity }) {
  const config = typeConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="relative flex gap-3 pl-1">
      <div className={cn('z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border', config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{activity.subject}</span>
              <Badge variant="outline" className="text-xs shrink-0">{config.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activity.createdBy.firstName} {activity.createdBy.lastName} &middot; {formatDateTime(activity.occurredAt)}
            </p>
          </div>
        </div>
        <ActivityTypeDetails activity={activity} />
      </div>
    </div>
  );
}

function ActivityTypeDetails({ activity }: { activity: Activity }) {
  switch (activity.type) {
    case 'NOTE':
      return activity.body ? (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{activity.body}</p>
      ) : null;

    case 'EMAIL':
      return activity.body ? (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{activity.body}</p>
      ) : null;

    case 'CALL':
      return activity.duration ? (
        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
          <Phone className="h-3 w-3" /> Durée : {formatDuration(activity.duration)}
        </p>
      ) : null;

    case 'MEETING':
      return activity.startAt ? (
        <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateTime(activity.startAt)}
          {activity.endAt && ` - ${formatDateTime(activity.endAt)}`}
        </p>
      ) : null;

    case 'TASK': {
      const isOverdue = activity.dueAt && !activity.completedAt && new Date(activity.dueAt) < new Date();
      return (
        <div className="mt-1 flex items-center gap-2 text-sm">
          {activity.completedAt ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Terminé le {formatDate(activity.completedAt)}
            </span>
          ) : activity.dueAt ? (
            <span className={cn('flex items-center gap-1', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
              <Clock className="h-3 w-3" /> Échéance le {formatDate(activity.dueAt)}
            </span>
          ) : null}
        </div>
      );
    }

    default:
      return null;
  }
}
