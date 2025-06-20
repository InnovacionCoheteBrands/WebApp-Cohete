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
    <div className="h-full flex flex-col overflow-hidden" data-tour="recent-schedules">
      <h2 className="mb-3 text-lg font-semibold flex-shrink-0">Recent Schedules</h2>
      <div className="flex-1 overflow-hidden">
        <div className="grid gap-3 grid-cols-1 h-full">
          {schedules.slice(0, 2).map((schedule) => (
            <Card key={schedule.id} className="shadow-sm h-fit bg-card text-card-foreground border-border">
              <CardContent className="border-b p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{schedule.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    New
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{schedule.project.client}</p>
              </CardContent>
              
              <div className="space-y-2 p-3">
                {/* Show placeholder if no entries are available */}
                {!schedule.entries || schedule.entries.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                    Loading schedule entries...
                  </div>
                ) : (
                  // Show first entry from the schedule
                  schedule.entries.slice(0, 1).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2 rounded-md border p-2">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">{entry.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {format(parseISO(entry.postDate), "MMM d")} • {entry.platform}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <CardFooter className="flex items-center justify-between border-t p-2">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground h-6 px-2"
                    onClick={() => window.open(`/api/schedules/${schedule.id}/download?format=excel`, '_blank')}
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-xs">Excel</span>
                  </Button>
                </div>
                <Link href={`/projects/${schedule.project.id}?tab=workflows`}>
                  <Button variant="secondary" size="sm" className="h-6 px-2 text-xs">Ver</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
