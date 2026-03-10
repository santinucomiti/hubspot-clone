import { PageHeader } from '@/components/page-header';
import { ContactListForm } from '@/features/marketing/lists';

export default function NewContactListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Créer une liste de contacts"
        description="Créez une nouvelle liste de contacts pour vos campagnes marketing."
      />
      <ContactListForm />
    </div>
  );
}
