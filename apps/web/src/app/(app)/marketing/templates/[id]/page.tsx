'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { TemplateForm } from '@/features/marketing/templates';
import {
  getEmailTemplate,
  type EmailTemplate,
} from '@/lib/api/email-templates';

export default function EmailTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplate = useCallback(async () => {
    try {
      const data = await getEmailTemplate(params.id);
      setTemplate(data);
    } catch {
      toast.error('Impossible de charger le modèle');
      router.push('/marketing/templates');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  if (isLoading || !template) {
    return (
      <div className="space-y-6">
        <PageHeader title="Modèle d'e-mail" />
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Modifier : ${template.name}`}
        description="Mettez à jour le contenu et les paramètres de votre modèle d'e-mail."
      />
      <TemplateForm initialData={template} />
    </div>
  );
}
