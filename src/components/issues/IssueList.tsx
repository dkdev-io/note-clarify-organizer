
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types/issue';
import { issueService } from '@/services/issueService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Clock, Hourglass, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const IssueList: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await issueService.getAllIssues();
        setIssues(data);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'in-progress':
        return <Hourglass className="h-4 w-4 mr-1" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'closed':
        return <XCircle className="h-4 w-4 mr-1" />;
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

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Issue Log</h1>
        <Button onClick={() => navigate('/app/issues/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Issue
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No issues have been logged yet.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/app/issues/new')}
          >
            Create your first issue
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium">{issue.title}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center ${getStatusColor(issue.status)}`}
                  >
                    {getStatusIcon(issue.status)} 
                    {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(issue.priority)}
                  >
                    {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(issue.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{issue.created_by || 'Anonymous'}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/app/issues/${issue.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default IssueList;
