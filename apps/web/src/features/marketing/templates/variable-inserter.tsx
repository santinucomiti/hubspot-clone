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
    { label: 'First Name', value: '{{contact.firstName}}' },
    { label: 'Last Name', value: '{{contact.lastName}}' },
    { label: 'Email', value: '{{contact.email}}' },
    { label: 'Phone', value: '{{contact.phone}}' },
  ]},
  { group: 'Company', items: [
    { label: 'Company Name', value: '{{company.name}}' },
    { label: 'Domain', value: '{{company.domain}}' },
  ]},
  { group: 'Links', items: [
    { label: 'Unsubscribe Link', value: '{{unsubscribeUrl}}' },
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
          Insert Variable
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
