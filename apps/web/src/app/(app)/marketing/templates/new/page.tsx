import { PageHeader } from '@/components/page-header';
import { TemplateForm } from '@/features/marketing/templates';

export default function NewEmailTemplatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Email Template"
        description="Design a new email template with HTML content and personalization variables."
      />
      <TemplateForm />
    </div>
  );
}
