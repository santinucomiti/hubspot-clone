'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import {
  getEmailTemplates,
  deleteEmailTemplate,
  type EmailTemplate,
} from '@/lib/api/email-templates';
import { getEmailTemplateColumns } from '@/features/marketing/templates';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await getEmailTemplates({ limit: 100 });
      setTemplates(response.data);
    } catch {
      toast.error('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmailTemplate(deleteTarget.id);
      toast.success('Template deleted');
      setDeleteTarget(null);
      fetchTemplates();
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = getEmailTemplateColumns({
    onDelete: setDeleteTarget,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Email Templates" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        description="Design reusable email templates for your marketing campaigns."
        actions={
          <Button asChild>
            <Link href="/marketing/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No email templates yet"
          description="Create your first email template to start building marketing campaigns."
          action={
            <Button asChild>
              <Link href="/marketing/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Link>
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={templates}
          searchKey="name"
          searchPlaceholder="Search templates..."
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Email Template"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone. Campaigns using this template will not be affected.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
