import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { DraggableTaskCard } from './draggable-task-card';
import { Task } from '@shared/schema';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  renderPriorityBadge?: (priority: string) => React.ReactNode;
  renderStatusBadge?: (status: string) => React.ReactNode;
  users: any[];
  className?: string;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
  renderPriorityBadge,
  renderStatusBadge,
  users,
  className
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id
  });

  return (
    <Card className={`flex flex-col h-full glass-panel-dark border-white/5 ${className || ''}`}>
      <CardHeader className="py-3 px-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium text-white">
            {title}
          </CardTitle>
          <Badge variant="outline" className="ml-2 border-white/10 bg-white/5 text-gray-300">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3" ref={setNodeRef}>
        <SortableContext
          items={tasks.map(task => `task-${task.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay tareas aquí
              </div>
            ) : (
              tasks.map(task => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id)}
                  renderPriorityBadge={renderPriorityBadge}
                  renderStatusBadge={renderStatusBadge}
                  users={users}
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}