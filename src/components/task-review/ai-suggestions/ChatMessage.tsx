
import React from 'react';
import { Bot, UserIcon, InfoIcon } from 'lucide-react';

type MessageType = {
  id: string;
  type: 'system' | 'ai' | 'user';
  content: string;
  timestamp: Date;
};

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { type, content, timestamp } = message;
  
  const renderIcon = () => {
    switch (type) {
      case 'ai':
        return <Bot className="h-6 w-6 text-blue-500" />;
      case 'user':
        return <UserIcon className="h-6 w-6 text-gray-500" />;
      case 'system':
        return <InfoIcon className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 p-1 rounded-full bg-muted">
        {renderIcon()}
      </div>
      
      <div className={`flex-1 ${type === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg text-sm ${
          type === 'ai' ? 'bg-blue-50 text-blue-900' : 
          type === 'user' ? 'bg-gray-100 text-gray-900' : 
          'bg-purple-50 text-purple-900'
        }`}>
          {content}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
