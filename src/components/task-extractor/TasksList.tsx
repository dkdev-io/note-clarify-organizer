
import React from 'react';
import { Task } from '@/utils/parser';
import TaskItemCard from './TaskItemCard';
import TasksEmpty from './TasksEmpty';

interface TasksListProps {
  tasks: Task[];
  selectedTasks: Task[];
  toggleTask: (task: Task) => void;
  onBack: () => void;
}

const TasksList: React.FC<TasksListProps> = ({ 
  tasks, 
  selectedTasks, 
  toggleTask,
  onBack
}) => {
  if (tasks.length === 0) {
    return <TasksEmpty onBack={onBack} />;
  }

  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskItemCard 
          key={task.id}
          task={task} 
          isSelected={selectedTasks.some(t => t.id === task.id)} 
          onSelect={toggleTask} 
        />
      ))}
    </div>
  );
};

export default TasksList;
