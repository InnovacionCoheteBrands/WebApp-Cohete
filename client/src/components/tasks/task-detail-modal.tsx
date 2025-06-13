import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, PaperclipIcon, MessageSquareIcon, UserIcon, ClockIcon, SaveIcon, UploadIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface Comment {
  id: number;
  content: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface Attachment {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

interface User {
  id: string;
  fullName: string;
  username: string;
}

interface TaskDetailModalProps {
  taskId: number;
  children: React.ReactNode;
}

export function TaskDetailModal({ taskId, children }: TaskDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const queryClient = useQueryClient();

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: ['/api/tasks', taskId],
    enabled: open,
  });

  // Fetch task comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ['/api/tasks', taskId, 'comments'],
    enabled: open,
  });

  // Fetch task attachments
  const { data: attachments = [], isLoading: attachmentsLoading } = useQuery<Attachment[]>({
    queryKey: ['/api/tasks', taskId, 'attachments'],
    enabled: open,
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: open,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask: Partial<Task>) =>
      fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      setIsEditing(false);
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'comments'] });
      setNewComment("");
    },
  });

  // Upload attachment mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'attachments'] });
    },
  });

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        assignedToId: task.assignedToId,
        dueDate: task.dueDate,
      });
      if (task.dueDate) {
        setSelectedDate(new Date(task.dueDate));
      }
    }
  }, [task]);

  const handleSave = () => {
    const updates: Partial<Task> = {
      ...editedTask,
      dueDate: selectedDate ? selectedDate.toISOString() : null,
    };
    updateTaskMutation.mutate(updates);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      uploadAttachmentMutation.mutate(formData);
    }
  };

  if (taskLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles de la Tarea</span>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateTaskMutation.isPending}>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Task Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={editedTask.title || ""}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  />
                ) : (
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editedTask.description || ""}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">{task.description || "Sin descripción"}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <Label>Asignado a</Label>
                  {isEditing ? (
                    <Select
                      value={editedTask.assignedToId || ""}
                      onValueChange={(value) => setEditedTask({ ...editedTask, assignedToId: value || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <UserIcon className="w-4 h-4" />
                      <span>{task.assignedTo?.fullName || "Sin asignar"}</span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <Label>Fecha de vencimiento</Label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {task.dueDate 
                          ? format(new Date(task.dueDate), "PPP", { locale: es })
                          : "Sin fecha"
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Badge variant="outline">{task.status}</Badge>
                <Badge variant="outline">{task.priority}</Badge>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-semibold">
                <MessageSquareIcon className="w-4 h-4" />
                Comentarios ({comments.length})
              </h4>

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{comment.user.fullName}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt), "PPp", { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Añadir un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  Enviar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Attachments Section */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-semibold">
                <PaperclipIcon className="w-4 h-4" />
                Archivos adjuntos ({attachments.length})
              </h4>

              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{attachment.fileName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(attachment.uploadedAt), "PPp", { locale: es })}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={attachment.fileUrl} download target="_blank" rel="noopener noreferrer">
                          Descargar
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploadAttachmentMutation.isPending}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Subir archivo
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}