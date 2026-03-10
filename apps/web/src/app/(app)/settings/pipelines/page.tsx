import { PageHeader } from '@/components/page-header';
import { PipelineSettings } from '@/features/deals/pipeline-settings';

export default function PipelineSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Settings"
        description="Configure your sales pipelines and customize deal stages"
      />
      <PipelineSettings />
    </div>
  );
}
