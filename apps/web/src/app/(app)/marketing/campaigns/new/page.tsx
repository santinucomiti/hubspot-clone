import { PageHeader } from '@/components/page-header';
import { CampaignWizard } from '@/features/marketing/campaigns';

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Campaign"
        description="Follow the wizard to set up and send your email campaign."
      />
      <CampaignWizard />
    </div>
  );
}
