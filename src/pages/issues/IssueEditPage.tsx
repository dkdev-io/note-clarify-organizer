
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IssueForm from '@/components/issues/IssueForm';
import { issueService } from '@/services/issueService';
import { IssueFormData } from '@/types/issue';
import { useToast } from '@/hooks/use-toast';

const IssueEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<IssueFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      try {
        const data = await issueService.getIssueById(id);
        if (data) {
          const formData: IssueFormData = {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            created_by: data.created_by || '',
            assigned_to: data.assigned_to || ''
          };
          setIssue(formData);
        } else {
          toast({
            title: "Issue not found",
            description: "The issue you're trying to edit doesn't exist.",
            variant: "destructive"
          });
          navigate('/app/issues');
        }
      } catch (error) {
        console.error('Failed to fetch issue:', error);
        toast({
          title: "Error",
          description: "Failed to load issue details.",
          variant: "destructive"
        });
        navigate('/app/issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!issue) {
    return null;
  }

  return <IssueForm initialData={issue} isEditing={true} issueId={id} />;
};

export default IssueEditPage;
