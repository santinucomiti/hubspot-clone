'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  type CustomPropertyDefinition,
  deleteDefinition,
} from '@/lib/api/custom-properties';

const fieldTypeBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  TEXT: 'default',
  NUMBER: 'secondary',
  DATE: 'outline',
  DROPDOWN: 'default',
};

interface PropertyDefinitionsTableProps {
  definitions: CustomPropertyDefinition[];
  onRefresh: () => void;
  onAdd: () => void;
}

export function PropertyDefinitionsTable({
  definitions,
  onRefresh,
  onAdd,
}: PropertyDefinitionsTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette propriété ? Toutes les valeurs seront supprimées.')) return;
    setDeleting(id);
    try {
      await deleteDefinition(id);
      toast.success('Propriété supprimée');
      onRefresh();
    } catch {
      toast.error('Échec de la suppression de la propriété');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Ajouter une propriété
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entité</TableHead>
              <TableHead>Obligatoire</TableHead>
              <TableHead>Options</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {definitions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucune propriété personnalisée définie pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              definitions.map((def) => (
                <TableRow key={def.id}>
                  <TableCell className="font-medium">{def.label}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{def.name}</TableCell>
                  <TableCell>
                    <Badge variant={fieldTypeBadgeVariant[def.fieldType] || 'outline'}>
                      {def.fieldType}
                    </Badge>
                  </TableCell>
                  <TableCell>{def.entityType}</TableCell>
                  <TableCell>{def.isRequired ? 'Oui' : 'Non'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {def.options ? (def.options as string[]).join(', ') : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleting === def.id}
                      onClick={() => handleDelete(def.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
