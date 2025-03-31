import { useState } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Plus } from "lucide-react";
import NewProjectModal from "@/components/projects/new-project-modal";
import { formatRelative } from "date-fns";

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

export default function Projects() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["/api/projects"],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700 my-4">
        <p>Error loading projects: {error.message}</p>
      </div>
    );
  }

  // Calculate pagination
  const totalProjects = projects?.length || 0;
  const totalPages = Math.ceil(totalProjects / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProjects);
  const currentProjects = projects?.slice(startIndex, endIndex) || [];

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
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
                <TableRow className="bg-muted/50">
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProjects.map((project) => (
                    <TableRow key={project.id} className="border-b">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell className="text-muted-foreground">{project.client}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelative(new Date(project.updatedAt), new Date())}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View Project">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user?.isPrimary && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Project">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalProjects}</strong> projects
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
