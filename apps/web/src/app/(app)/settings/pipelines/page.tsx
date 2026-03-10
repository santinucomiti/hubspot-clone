import { PageHeader } from '@/components/page-header';
import { PipelineSettings } from '@/features/deals/pipeline-settings';

export default function PipelineSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres des pipelines"
        description="Configurez vos pipelines de ventes et personnalisez les étapes des affaires"
      />
      <PipelineSettings />
    </div>
  );
}
