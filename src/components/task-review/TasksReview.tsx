
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Task } from '@/utils/task-parser/types';
import { refineTask } from '@/utils/task-parser/task-editor';
import TasksList from './TasksList';
import TaskReviewHeader from './TaskReviewHeader';
import TaskReviewFooter from './TaskReviewFooter';
import EditTaskForm from './EditTaskForm';
import { generateId } from '@/utils/task-parser/utils';

interface TasksReviewProps {
  rawText: string;
  initialTasks: Task[];
  projectName: string | null;
  onBack: () => void;
  onAddToMotion: (tasks: Task[], projectName: string | null) => void;
  apiProps: any;
  skipReview?: boolean;
}

const TasksReview: React.FC<TasksReviewProps> = ({
  rawText,
  initialTasks,
  projectName,
  onBack,
  onAddToMotion,
  apiProps,
  skipReview = false
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(projectName);

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveEdit = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTask = (taskId: string, field: keyof Task, value: any) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? refineTask(task, { [field]: value }) 
          : task
      )
    );
  };

  const handleContinue = () => {
    if (skipReview) {
      // Skip review - go directly to completion
      onAddToMotion(tasks, currentProjectName);
    } else {
      onAddToMotion(tasks, currentProjectName);
    }
  };

  const handleProjectNameChange = (name: string | null) => {
    setCurrentProjectName(name);
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
      workspace_id: apiProps.selectedWorkspaceId || null,
      isRecurring: false,
      frequency: null,
      project: currentProjectName,
      projectId: apiProps.selectedProjectId || null,
      duration: null,
      timeEstimate: null,
      folder: null,
      autoScheduled: true,
      isPending: false,
      schedule: "Work hours",
      labels: null,
      customFields: null
    };
    
    setTasks([...tasks, newTask]);
    setEditingTaskId(newTask.id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="bg-white shadow-sm border">
        <TaskReviewHeader
          tasksCount={tasks.length}
          projectName={currentProjectName}
          onProjectNameChange={handleProjectNameChange}
          rawText={rawText}
        />
        
        <TasksList
          tasks={tasks}
          editingTaskId={editingTaskId}
          onEditTask={handleEditTask}
          onUpdateTask={handleUpdateTask}
          onSaveEdit={handleSaveEdit}
          onAddTask={handleAddTask}
        />
        
        <TaskReviewFooter
          onBack={onBack}
          onContinue={handleContinue}
          tasksCount={tasks.length}
        />
      </Card>
    </div>
  );
};

export default TasksReview;
