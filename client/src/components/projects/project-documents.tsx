import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  FileIcon, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  ArrowUpRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Document {
  id: number;
  projectId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  analysisStatus: string;
  analysisResults: any;
  createdAt: string;
}

interface ProjectDocumentsProps {
  projectId: number;
}

export default function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents for the project
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: [`/api/projects/${projectId}/documents`],
    staleTime: 30000,
    refetchInterval: (data) => {
      // Refetch while any document is processing
      if (data?.some(doc => doc.analysisStatus === 'processing')) {
        return 5000;
      }
      return false;
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || res.statusText);
      }
      
      return await res.json();
    },
    onMutate: () => {
      setIsUploading(true);
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and is being analyzed",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Use analysis for project mutation
  const useAnalysisMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/projects/${projectId}/documents/${documentId}/use-analysis`,
        {}
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis applied",
        description: "Document analysis has been applied to the project",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setIsDetailsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error applying analysis",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    uploadDocumentMutation.mutate(formData);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleViewDetails = (document: Document) => {
    setSelectedDocument(document);
    setIsDetailsOpen(true);
  };

  const handleUseAnalysis = () => {
    if (selectedDocument && selectedDocument.analysisStatus === 'completed') {
      useAnalysisMutation.mutate(selectedDocument.id);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-700">
        <p>Error loading documents: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Documents</h2>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <Button 
            onClick={triggerFileInput}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {!documents || documents.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="p-0">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Documents</h3>
            <p className="text-muted-foreground mb-6">
              Upload marketing documents to analyze them with AI
            </p>
            <Button onClick={triggerFileInput}>Upload Your First Document</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Document</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-muted">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{document.originalName}</div>
                        <div className="text-xs text-muted-foreground">
                          {document.mimeType}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(document.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(document.analysisStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(document)}
                      disabled={document.analysisStatus !== 'completed'}
                      className="gap-1"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span>View Analysis</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Document Analysis Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.originalName}</DialogTitle>
            <DialogDescription>
              Uploaded on {selectedDocument ? format(parseISO(selectedDocument.createdAt), "MMMM d, yyyy") : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument?.analysisResults ? (
            <div className="space-y-4">
              {selectedDocument.analysisResults.summary && (
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDocument.analysisResults.summary}
                  </p>
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                {selectedDocument.analysisResults.mission && (
                  <AccordionItem value="mission">
                    <AccordionTrigger>Mission</AccordionTrigger>
                    <AccordionContent>
                      {selectedDocument.analysisResults.mission}
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {selectedDocument.analysisResults.vision && (
                  <AccordionItem value="vision">
                    <AccordionTrigger>Vision</AccordionTrigger>
                    <AccordionContent>
                      {selectedDocument.analysisResults.vision}
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {selectedDocument.analysisResults.objectives && (
                  <AccordionItem value="objectives">
                    <AccordionTrigger>Objectives</AccordionTrigger>
                    <AccordionContent>
                      {selectedDocument.analysisResults.objectives}
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {selectedDocument.analysisResults.targetAudience && (
                  <AccordionItem value="audience">
                    <AccordionTrigger>Target Audience</AccordionTrigger>
                    <AccordionContent>
                      {selectedDocument.analysisResults.targetAudience}
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {selectedDocument.analysisResults.brandTone && (
                  <AccordionItem value="tone">
                    <AccordionTrigger>Brand Tone</AccordionTrigger>
                    <AccordionContent>
                      {selectedDocument.analysisResults.brandTone}
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {selectedDocument.analysisResults.keywords && (
                  <AccordionItem value="keywords">
                    <AccordionTrigger>Keywords</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-1">
                        {selectedDocument.analysisResults.keywords.split(/[,;]/).map((keyword: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {selectedDocument.analysisResults.contentThemes && (
                  <AccordionItem value="themes">
                    <AccordionTrigger>Content Themes</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {selectedDocument.analysisResults.contentThemes.map((theme: any, i: number) => (
                          <div key={i} className="rounded-md border p-3">
                            <div className="font-medium">{theme.theme}</div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {theme.keywords.map((keyword: string, j: number) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No analysis data available
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cancel
            </Button>
            {user?.isPrimary && selectedDocument?.analysisStatus === 'completed' && (
              <Button 
                onClick={handleUseAnalysis}
                disabled={useAnalysisMutation.isPending}
              >
                {useAnalysisMutation.isPending ? "Applying..." : "Use this Analysis for Project"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
