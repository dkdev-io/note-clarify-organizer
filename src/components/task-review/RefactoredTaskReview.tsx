
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Task } from '@/utils/parser';
import { generateId } from '@/utils/task-parser/utils';
import TaskReviewHeader from './TaskReviewHeader';
import TasksList from './TasksList';
import TaskReviewFooter from './TaskReviewFooter';
import { ApiProps } from '@/pages/converter/types';
import TaskEditForm from './TaskEditForm';

export interface RefactoredTaskReviewProps {
  tasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onContinue: (tasks: Task[], updatedProjectName?: string) => void;
  apiProps?: ApiProps;
}

const RefactoredTaskReview: React.FC<RefactoredTaskReviewProps> = ({ 
  tasks, 
  projectName, 
  onBack, 
  onContinue,
  apiProps
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTasks, setEditedTasks] = useState<Task[]>(tasks);
  const [editedProjectName, setEditedProjectName] = useState<string | null>(projectName);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Debug logs to trace task flow
  console.log('RefactoredTaskReview received tasks:', tasks);
  console.log('Current editedTasks state:', editedTasks);

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveTask = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTask = (taskId: string, field: keyof Task | 'deleted', value: any) => {
    if (field === 'deleted') {
      setEditedTasks(editedTasks.filter(task => task.id !== taskId));
      return;
    }
    
    setEditedTasks(editedTasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: generateId(),
      title: "New Task",
      description: "",
      dueDate: null,
      startDate: null,
      hardDeadline: false,
      priority: null,
      status: 'todo',
      assignee: null,
      workspace_id: apiProps?.selectedWorkspaceId || null,
      isRecurring: false,
      frequency: null,
      project: editedProjectName,
      projectId: apiProps?.selectedProjectId || null,
      duration: null,
      timeEstimate: null,
      folder: null,
      autoScheduled: true,
      isPending: false,
      schedule: "Work hours",
      labels: null,
      customFields: null
    };
    
    setEditedTasks([...editedTasks, newTask]);
    setEditingTaskId(newTask.id);
  };

  const handleContinue = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue(editedTasks, editedProjectName !== projectName ? editedProjectName : undefined);
    }, 400);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onBack();
    }, 400);
  };

  const handleProjectNameChange = (name: string | null) => {
    setEditedProjectName(name);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      <Card className="bg-white bg-opacity-80 backdrop-blur-sm border border-gray-100 shadow-card overflow-hidden">
        <TaskReviewHeader 
          tasksCount={editedTasks.length}
          projectName={editedProjectName}
          onProjectNameChange={handleProjectNameChange}
          rawText=""
        />
        
        {editingTaskId && (
          <TaskEditForm 
            task={editedTasks.find(t => t.id === editingTaskId)!}
            onSave={handleSaveTask}
            onUpdate={(field, value) => handleUpdateTask(editingTaskId, field, value)}
            apiProps={apiProps}
          />
        )}
        
        {!editingTaskId && (
          <TasksList 
            tasks={editedTasks}
            editingTaskId={editingTaskId}
            onEditTask={handleEditTask}
            onUpdateTask={handleUpdateTask}
            onSaveEdit={handleSaveTask}
            onAddTask={handleAddTask}
          />
        )}
        
        <TaskReviewFooter 
          onBack={handleBack}
          onContinue={handleContinue}
          isTransitioning={isTransitioning}
          editingTaskId={editingTaskId}
          tasksCount={editedTasks.length}
        />
      </Card>
    </div>
  );
};

export default RefactoredTaskReview;
