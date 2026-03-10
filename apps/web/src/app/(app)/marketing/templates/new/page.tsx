import { PageHeader } from '@/components/page-header';
import { TemplateForm } from '@/features/marketing/templates';

export default function NewEmailTemplatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer un modèle d'e-mail"
        description="Concevez un nouveau modèle d'e-mail avec du contenu HTML et des variables de personnalisation."
      />
      <TemplateForm />
    </div>
  );
}
