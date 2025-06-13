import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import NewProjectModal from "@/components/projects/new-project-modal";

type Project = {
  id: number;
  name: string;
  client: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  startDate?: string | null;
  endDate?: string | null;
  createdBy?: number | null;
};

// Project status badges
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "active":
        return {
          className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
          label: "Active"
        };
      case "planning":
        return {
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          label: "Planning"
        };
      case "completed":
        return {
          className: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
          label: "Completed"
        };
      case "on_hold":
        return {
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
          label: "On Hold"
        };
      default:
        return {
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
        };
    }
  };

  const { className, label } = getStatusProps();

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default function RecentProjects() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 60000,
  });

  // Display at most 3 most recent projects
  const recentProjects = projects ? projects.slice(0, 3) : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Projects</h2>
        {user?.isPrimary && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50 text-left">
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-destructive">
                    Error loading projects
                  </TableCell>
                </TableRow>
              ) : recentProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                recentProjects.map((project: Project) => (
                  <TableRow key={project.id} className="border-b">
                    <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {project.client}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-sm">
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {format(parseISO(project.updatedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {user?.isPrimary && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{recentProjects.length}</strong> of <strong>{projects?.length || 0}</strong> projects
          </p>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              View All Projects
            </Button>
          </Link>
        </div>
      </div>

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
