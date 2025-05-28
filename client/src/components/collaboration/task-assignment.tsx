import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserPlus, User, X } from "lucide-react";

interface TaskAssignmentProps {
  taskId: number;
  currentAssignee?: {
    id: number;
    fullName: string;
    username: string;
    profileImage?: string;
  } | null;
  additionalAssignees?: {
    id: number;
    fullName: string;
    username: string;
    profileImage?: string;
  }[];
  onAssignmentChange?: () => void;
}

interface User {
  id: number;
  fullName: string;
  username: string;
  profileImage?: string;
}

export default function TaskAssignment({ 
  taskId, 
  currentAssignee, 
  additionalAssignees = [],
  onAssignmentChange 
}: TaskAssignmentProps) {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);

  // Obtener usuarios disponibles
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // Mutación para asignar usuario principal
  const assignUserMutation = useMutation({
    mutationFn: (userId: number | null) =>
      apiRequest(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId: userId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onAssignmentChange?.();
      toast({
        title: "Asignación actualizada",
        description: "La tarea ha sido asignada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la asignación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Mutación para agregar asignado adicional
  const addAssigneeMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest(`/api/tasks/${taskId}/assignees`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onAssignmentChange?.();
      setIsAssigning(false);
      toast({
        title: "Colaborador agregado",
        description: "El usuario ha sido agregado como colaborador.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el colaborador. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Mutación para remover asignado adicional
  const removeAssigneeMutation = useMutation({
    mutationFn: (userId: number) =>
      apiRequest(`/api/tasks/${taskId}/assignees/${userId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onAssignmentChange?.();
      toast({
        title: "Colaborador removido",
        description: "El usuario ha sido removido de la tarea.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo remover el colaborador. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleAssignUser = (userId: string) => {
    const numericUserId = userId === "unassign" ? null : parseInt(userId);
    assignUserMutation.mutate(numericUserId);
  };

  const handleAddAssignee = (userId: string) => {
    if (userId && userId !== "select") {
      const numericUserId = parseInt(userId);
      // Verificar que no esté ya asignado
      const isAlreadyAssigned = currentAssignee?.id === numericUserId ||
        additionalAssignees.some(a => a.id === numericUserId);
      
      if (!isAlreadyAssigned) {
        addAssigneeMutation.mutate(numericUserId);
      } else {
        toast({
          title: "Usuario ya asignado",
          description: "Este usuario ya está asignado a la tarea.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveAssignee = (userId: number) => {
    removeAssigneeMutation.mutate(userId);
  };

  const getAvailableUsers = () => {
    const assignedUserIds = [
      currentAssignee?.id,
      ...additionalAssignees.map(a => a.id)
    ].filter(Boolean);
    
    return users.filter((user: User) => !assignedUserIds.includes(user.id));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Asignado principal */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            {currentAssignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={currentAssignee.profileImage} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{currentAssignee.fullName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="text-xs">Sin asignar</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Asignar responsable principal</h4>
            <Select onValueChange={handleAssignUser} disabled={assignUserMutation.isPending}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">Sin asignar</SelectItem>
                {users.map((user: User) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.fullName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      {/* Asignados adicionales */}
      {additionalAssignees.map((assignee) => (
        <Badge key={assignee.id} variant="secondary" className="flex items-center gap-1 pl-1">
          <Avatar className="h-4 w-4">
            <AvatarImage src={assignee.profileImage} />
            <AvatarFallback>
              <User className="h-2 w-2" />
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">{assignee.fullName}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleRemoveAssignee(assignee.id)}
            disabled={removeAssigneeMutation.isPending}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Botón para agregar colaboradores */}
      {getAvailableUsers().length > 0 && (
        <Popover open={isAssigning} onOpenChange={setIsAssigning}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <UserPlus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Agregar colaborador</h4>
              <Select onValueChange={handleAddAssignee} disabled={addAssigneeMutation.isPending}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableUsers().map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.fullName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}