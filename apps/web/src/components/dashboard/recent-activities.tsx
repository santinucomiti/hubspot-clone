'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: string;
  type: string;
  subject: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
}

interface RecentActivitiesProps {
  data?: Activity[];
  isLoading?: boolean;
}

const activityTypeColors: Record<string, string> = {
  NOTE: 'bg-blue-100 text-blue-700',
  EMAIL: 'bg-green-100 text-green-700',
  CALL: 'bg-amber-100 text-amber-700',
  MEETING: 'bg-purple-100 text-purple-700',
  TASK: 'bg-red-100 text-red-700',
};

export function RecentActivities({ data, isLoading }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activities</CardTitle>
        <CardDescription>Latest team activity across all modules</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activities
          </p>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3">
              {data.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50"
                >
                  <Badge
                    variant="secondary"
                    className={
                      activityTypeColors[activity.type] || 'bg-muted text-muted-foreground'
                    }
                  >
                    {activity.type.toLowerCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.createdBy.firstName} {activity.createdBy.lastName}{' '}
                      &middot;{' '}
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
