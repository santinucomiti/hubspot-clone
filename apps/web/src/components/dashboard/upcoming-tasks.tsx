'use client';

import { CheckCircle2, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Task {
  id: string;
  subject: string;
  dueAt: string;
  contactName?: string;
}

interface UpcomingTasksProps {
  data?: Task[];
  isLoading?: boolean;
}

export function UpcomingTasks({ data, isLoading }: UpcomingTasksProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  function isOverdue(dueAt: string): boolean {
    return new Date(dueAt) < new Date();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tâches à venir</CardTitle>
        <CardDescription>Tâches bientôt dues</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Tout est à jour ! Aucune tâche à venir.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {data.map((task) => {
                const overdue = isOverdue(task.dueAt);
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <Clock
                      className={`h-4 w-4 mt-0.5 ${
                        overdue ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.subject}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={overdue ? 'text-red-500 font-medium' : ''}
                        >
                          {overdue ? 'En retard : ' : 'Échéance : '}
                          {new Date(task.dueAt).toLocaleDateString('fr-FR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {task.contactName && (
                          <>
                            <span>&middot;</span>
                            <span>{task.contactName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
