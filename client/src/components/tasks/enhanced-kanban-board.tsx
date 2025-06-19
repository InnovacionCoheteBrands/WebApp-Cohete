import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Badge
} from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Circle,
  Pause,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  dueDate?: string | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  users: any[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  users: any[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  count: number;
  color: string;
}

interface EnhancedKanbanBoardProps {
  tasks: Task[];
  users: any[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: string) => void;
}

const statusConfig = {
  pending: {
    title: 'Pendientes',
    color: 'bg-gray-100 border-gray-300',
    icon: Circle,
    badgeVariant: 'secondary' as const
  },
  in_progress: {
    title: 'En Progreso',
    color: 'bg-blue-100 border-blue-300',
    icon: Clock,
    badgeVariant: 'default' as const
  },
  review: {
    title: 'En Revisión',
    color: 'bg-yellow-100 border-yellow-300',
    icon: AlertCircle,
    badgeVariant: 'outline' as const
  },
  completed: {
    title: 'Completadas',
    color: 'bg-green-100 border-green-300',
    icon: CheckCircle,
    badgeVariant: 'default' as const
  },
  cancelled: {
    title: 'Canceladas',
    color: 'bg-red-100 border-red-300',
    icon: X,
    badgeVariant: 'destructive' as const
  }
};

const priorityConfig = {
  low: { color: 'bg-gray-500', label: 'Baja' },
  medium: { color: 'bg-blue-500', label: 'Media' },
  high: { color: 'bg-orange-500', label: 'Alta' },
  urgent: { color: 'bg-red-500', label: 'Urgente' },
  critical: { color: 'bg-purple-600', label: 'Crítica' }
};

function SortableTaskCard({ task, users, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignedUser = users.find(user => user.id === task.assignedToId);
  const priorityInfo = priorityConfig[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className={`mb-3 ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Priority indicator */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${priorityInfo.color} mr-1`} />
                <span className="text-xs text-muted-foreground">{priorityInfo.label}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Due date */}
              {task.dueDate && (
                <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), 'dd/MM', { locale: es })}
                </div>
              )}
              
              {/* Assigned user */}
              {assignedUser && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignedUser.profileImage || undefined} />
                  <AvatarFallback className="text-xs">
                    {assignedUser.fullName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({ id, title, tasks, users, onEdit, onDelete, count, color }: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: id,
    data: {
      type: 'Column',
      column: id,
    },
  });

  const StatusIcon = statusConfig[id as keyof typeof statusConfig]?.icon || Circle;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-h-[500px] p-4 rounded-lg border-2 ${color} ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-4 w-4" />
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {count}
          </Badge>
        </div>
      </div>

      <SortableContext items={tasks.map(task => task.id.toString())} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              users={users}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function EnhancedKanbanBoard({ 
  tasks, 
  users, 
  onEdit, 
  onDelete, 
  onUpdateTaskStatus 
}: EnhancedKanbanBoardProps) {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped = {
      pending: [] as Task[],
      in_progress: [] as Task[],
      review: [] as Task[],
      completed: [] as Task[],
      cancelled: [] as Task[]
    };

    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = parseInt(active.id as string);
    const task = tasks.find(t => t.id === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = parseInt(active.id as string);
    const newStatus = over.id as string;

    // Only update if status actually changed
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    }

    setActiveTask(null);
  };

  const columns = Object.entries(statusConfig).map(([status, config]) => ({
    id: status,
    title: config.title,
    tasks: tasksByStatus[status as keyof typeof tasksByStatus] || [],
    count: (tasksByStatus[status as keyof typeof tasksByStatus] || []).length,
    color: config.color
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              users={users}
              onEdit={onEdit}
              onDelete={onDelete}
              count={column.count}
              color={column.color}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeTask && (
          <SortableTaskCard
            task={activeTask}
            users={users}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}