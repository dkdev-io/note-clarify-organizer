
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Clock, 
  Hourglass, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      try {
        const data = await issueService.getIssueById(id);
        setIssue(data);
      } catch (error) {
        console.error('Failed to fetch issue:', error);
        toast({
          title: "Error",
          description: "Failed to load issue details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await issueService.deleteIssue(id);
      toast({
        title: "Issue deleted",
        description: "The issue has been successfully deleted."
      });
      navigate('/app/issues');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete issue.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-5 w-5 mr-2" />;
      case 'in-progress':
        return <Hourglass className="h-5 w-5 mr-2" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'closed':
        return <XCircle className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 mr-2" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/app/issues')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">Issue Not Found</h2>
          <p className="text-gray-500 mt-2">The issue you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/app/issues')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Issues
      </Button>
      
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/app/issues/edit/${issue.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the issue from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        Deleting...
                      </div>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge 
            variant="outline" 
            className={`flex items-center text-sm px-3 py-1 ${getStatusColor(issue.status)}`}
          >
            {getStatusIcon(issue.status)} 
            Status: {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={`flex items-center text-sm px-3 py-1 ${getPriorityColor(issue.priority)}`}
          >
            {getPriorityIcon(issue.priority)}
            Priority: {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
          </Badge>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
            {issue.description || 'No description provided.'}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500 space-y-2">
          <p>Created by: {issue.created_by || 'Anonymous'}</p>
          <p>Created on: {format(new Date(issue.created_at), 'MMMM d, yyyy h:mm a')}</p>
          <p>Last updated: {format(new Date(issue.updated_at), 'MMMM d, yyyy h:mm a')}</p>
          {issue.assigned_to && <p>Assigned to: {issue.assigned_to}</p>}
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
