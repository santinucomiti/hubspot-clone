'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyDefinitionsTable } from '@/features/crm/custom-properties/property-definitions-table';
import { PropertyDefinitionForm } from '@/features/crm/custom-properties/property-definition-form';
import {
  listDefinitions,
  type CustomPropertyDefinition,
} from '@/lib/api/custom-properties';

export default function CustomPropertiesSettingsPage() {
  const [definitions, setDefinitions] = useState<CustomPropertyDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<'CONTACT' | 'COMPANY'>('CONTACT');

  const fetchDefinitions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDefinitions(tab);
      setDefinitions(result.data);
    } catch {
      // Error handled by API client interceptor
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchDefinitions();
  }, [fetchDefinitions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Properties"
        description="Define custom fields for contacts and companies."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'CONTACT' | 'COMPANY')}>
        <TabsList>
          <TabsTrigger value="CONTACT">Contact Properties</TabsTrigger>
          <TabsTrigger value="COMPANY">Company Properties</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <PropertyDefinitionsTable
              definitions={definitions}
              onRefresh={fetchDefinitions}
              onAdd={() => setFormOpen(true)}
            />
          )}
        </TabsContent>
      </Tabs>

      <PropertyDefinitionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={fetchDefinitions}
      />
    </div>
  );
}
