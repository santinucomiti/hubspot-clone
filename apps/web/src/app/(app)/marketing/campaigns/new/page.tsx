import { PageHeader } from '@/components/page-header';
import { CampaignWizard } from '@/features/marketing/campaigns';

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer une campagne"
        description="Suivez l'assistant pour configurer et envoyer votre campagne e-mail."
      />
      <CampaignWizard />
    </div>
  );
}
