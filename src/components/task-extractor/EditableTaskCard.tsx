import React, { useState } from 'react';
import { Task } from '@/utils/parser';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, EditIcon, SaveIcon, XIcon } from 'lucide-react';

interface EditableTaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

const EditableTaskCard: React.FC<EditableTaskCardProps> = ({ 
  task, 
  isSelected, 
  onSelect,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (isEditing) {
    return (
      <div className="py-3 px-3 -mx-3 first:pt-0 bg-accent/30 rounded-md border border-accent">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="pt-0.5">
              <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-gray-300 bg-white'
              }`}>
                {isSelected && <CheckCircleIcon className="h-5 w-5" />}
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Task title"
                className="font-medium"
              />
              
              <Textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Task description"
                className="text-sm"
                rows={2}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={editedTask.dueDate ? formatDate(editedTask.dueDate) : ''}
                    onChange={(e) => setEditedTask({ 
                      ...editedTask, 
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                    })}
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Priority</label>
                  <Select 
                    value={editedTask.priority || 'medium'} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as any })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Assignee</label>
                  <Input
                    value={editedTask.assignee || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value || undefined })}
                    placeholder="Assignee name"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Duration</label>
                  <Input
                    value={editedTask.duration || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, duration: e.target.value || undefined })}
                    placeholder="e.g., 2 hours"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <XIcon className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  <SaveIcon className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      key={task.id} 
      className={`py-3 px-3 -mx-3 first:pt-0 cursor-pointer rounded-md transition-colors group ${
        isSelected 
          ? 'bg-accent/50 hover:bg-accent/70' 
          : 'hover:bg-secondary/60'
      }`}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
            isSelected 
              ? 'border-primary bg-primary text-white' 
              : 'border-gray-300 bg-white'
          }`}>
            {isSelected && (
              <CheckCircleIcon className="h-5 w-5" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <EditIcon className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {task.dueDate && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
            {task.priority && (
              <Badge 
                variant="outline" 
                className={`text-[10px] ${
                  task.priority === 'high' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : task.priority === 'medium' 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                      : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </Badge>
            )}
            {task.assignee && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                Assignee: {task.assignee}
              </Badge>
            )}
            {task.project && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                Project: {task.project}
              </Badge>
            )}
            {task.duration && (
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">
                {task.duration}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableTaskCard;