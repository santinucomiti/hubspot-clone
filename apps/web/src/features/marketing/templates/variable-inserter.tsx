'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Variable } from 'lucide-react';

const VARIABLES = [
  { group: 'Contact', items: [
    { label: 'Prénom', value: '{{contact.firstName}}' },
    { label: 'Nom de famille', value: '{{contact.lastName}}' },
    { label: 'E-mail', value: '{{contact.email}}' },
    { label: 'Téléphone', value: '{{contact.phone}}' },
  ]},
  { group: 'Entreprise', items: [
    { label: 'Nom de l\'entreprise', value: '{{company.name}}' },
    { label: 'Domaine', value: '{{company.domain}}' },
  ]},
  { group: 'Liens', items: [
    { label: 'Lien de désabonnement', value: '{{unsubscribeUrl}}' },
  ]},
];

interface VariableInserterProps {
  onInsert: (variable: string) => void;
}

export function VariableInserter({ onInsert }: VariableInserterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Variable className="mr-2 h-4 w-4" />
          Insérer une variable
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {VARIABLES.map((group, groupIndex) => (
          <div key={group.group}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group.group}</DropdownMenuLabel>
            {group.items.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => onInsert(item.value)}
                className="cursor-pointer"
              >
                <code className="mr-2 text-xs bg-muted px-1 py-0.5 rounded">
                  {item.value}
                </code>
                <span className="text-muted-foreground text-xs">
                  {item.label}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
