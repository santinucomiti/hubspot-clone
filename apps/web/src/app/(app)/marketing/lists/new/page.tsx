import { PageHeader } from '@/components/page-header';
import { ContactListForm } from '@/features/marketing/lists';

export default function NewContactListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Contact List"
        description="Build a new contact list for your marketing campaigns."
      />
      <ContactListForm />
    </div>
  );
}
