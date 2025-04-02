import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

interface ScheduleEntry {
  id: number;
  title: string;
  platform: string;
  postDate: string;
  hashtags: string;
}

interface Schedule {
  id: number;
  name: string;
  project: {
    id: number;
    name: string;
    client: string;
  };
  createdAt: string;
  entries?: ScheduleEntry[];
}

export default function RecentSchedules() {
  // Fetch recent schedules
  const { data: schedules, isLoading, error } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules/recent"],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Schedules</h2>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Schedules</h2>
        <div className="p-4 border rounded-md bg-red-50 text-red-700">
          <p>Error loading schedules: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Schedules</h2>
        <div className="p-8 border rounded-md text-center text-muted-foreground">
          <p>No schedules have been created yet.</p>
          <p className="mt-2">Generate a schedule from the "Create Quick Schedule" section above.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Recent Schedules</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="shadow-sm">
            <CardContent className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{schedule.name}</h3>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  New
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{schedule.project.client}</p>
            </CardContent>
            
            <div className="space-y-3 p-4">
              {/* Show placeholder if no entries are available */}
              {!schedule.entries || schedule.entries.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  Loading schedule entries...
                </div>
              ) : (
                // Show first 2 entries from the schedule
                schedule.entries.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-md border p-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{entry.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {format(parseISO(entry.postDate), "MMM d, yyyy")} • {entry.platform}
                      </div>
                      <div className="mt-2 text-xs">{entry.hashtags}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <CardFooter className="flex items-center justify-between border-t p-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => window.open(`/api/schedules/${schedule.id}/download`, '_blank')}
              >
                <Download className="h-4 w-4" />
                <span className="text-xs">Excel</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {format(parseISO(schedule.createdAt), "MMM d, yyyy")}
                </span>
                <Link href={`/projects/${schedule.project.id}?tab=workflows`}>
                  <Button variant="secondary" size="sm">Ver</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
