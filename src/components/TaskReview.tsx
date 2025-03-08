
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, refineTask } from '@/utils/parser';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, CheckCircle2Icon, EditIcon, TrashIcon } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface TaskReviewProps {
  tasks: Task[];
  onBack: () => void;
  onContinue: (tasks: Task[]) => void;
}

const TaskReview: React.FC<TaskReviewProps> = ({ tasks, onBack, onContinue }) => {
  const [reviewedTasks, setReviewedTasks] = useState<Task[]>(tasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask({ ...task });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTask(null);
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      setReviewedTasks(reviewedTasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setEditingTaskId(null);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setReviewedTasks(reviewedTasks.filter(task => task.id !== taskId));
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue(reviewedTasks);
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-gray-900 flex items-center">
            <CheckCircle2Icon className="inline-block mr-2 h-6 w-6 text-primary" />
            Review Tasks
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Review and edit your tasks before sending them to Motion
          </p>
        </CardHeader>
        
        <CardContent className="pb-0">
          {reviewedTasks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No tasks selected.</p>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Extraction
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-1">
              {reviewedTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className={`shadow-subtle overflow-hidden ${
                    editingTaskId === task.id ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'
                  }`}
                >
                  {editingTaskId === task.id && editingTask ? (
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input 
                          id="title"
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                          className="border-gray-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description"
                          value={editingTask.description}
                          onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                          className="border-gray-200 resize-none min-h-[80px]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal border-gray-200"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editingTask.dueDate ? (
                                  format(new Date(editingTask.dueDate), "PPP")
                                ) : (
                                  <span className="text-muted-foreground">Select date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={editingTask.dueDate ? new Date(editingTask.dueDate) : undefined}
                                onSelect={(date) => setEditingTask({
                                  ...editingTask, 
                                  dueDate: date ? format(date, "yyyy-MM-dd") : null
                                })}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select 
                            value={editingTask.priority || ''} 
                            onValueChange={(value) => setEditingTask({
                              ...editingTask, 
                              priority: value as 'low' | 'medium' | 'high' | null
                            })}
                          >
                            <SelectTrigger id="priority" className="border-gray-200">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Priority</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Input 
                          id="assignee"
                          value={editingTask.assignee || ''}
                          onChange={(e) => setEditingTask({...editingTask, assignee: e.target.value || null})}
                          placeholder="Enter assignee name"
                          className="border-gray-200"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveEdit}
                          size="sm"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <div className="flex gap-1 ml-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-primary"
                            onClick={() => handleEditTask(task)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {task.dueDate && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </Badge>
                        )}
                        {task.priority && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
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
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            Assignee: {task.assignee}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between py-4 mt-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isTransitioning}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={reviewedTasks.length === 0 || isTransitioning}
            className="transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Preview Tasks
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskReview;
