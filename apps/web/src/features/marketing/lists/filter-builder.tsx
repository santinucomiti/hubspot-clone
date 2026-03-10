'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContactListFilter } from '@/lib/api/contact-lists';

const FILTER_FIELDS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'lifecycleStage', label: 'Lifecycle Stage' },
];

const FILTER_OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'in', label: 'is one of' },
];

const LIFECYCLE_STAGE_OPTIONS = ['SUBSCRIBER', 'LEAD', 'OPPORTUNITY', 'CUSTOMER'];

interface FilterBuilderProps {
  filters: ContactListFilter[];
  onChange: (filters: ContactListFilter[]) => void;
}

export function FilterBuilder({ filters, onChange }: FilterBuilderProps) {
  function addFilter() {
    onChange([
      ...filters,
      { field: 'firstName', operator: 'contains', value: '' },
    ]);
  }

  function removeFilter(index: number) {
    onChange(filters.filter((_, i) => i !== index));
  }

  function updateFilter(
    index: number,
    updates: Partial<ContactListFilter>,
  ) {
    const updated = filters.map((filter, i) =>
      i === index ? { ...filter, ...updates } : filter,
    );
    onChange(updated);
  }

  function renderValueInput(filter: ContactListFilter, index: number) {
    // Special handling for lifecycle stage -- show a dropdown
    if (filter.field === 'lifecycleStage' && filter.operator === 'equals') {
      return (
        <Select
          value={filter.value as string}
          onValueChange={(value) => updateFilter(index, { value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {LIFECYCLE_STAGE_OPTIONS.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage.charAt(0) + stage.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For "in" operator, comma-separated input
    if (filter.operator === 'in') {
      return (
        <Input
          placeholder="value1, value2, value3"
          value={
            Array.isArray(filter.value)
              ? filter.value.join(', ')
              : (filter.value as string)
          }
          onChange={(e) =>
            updateFilter(index, {
              value: e.target.value.split(',').map((v) => v.trim()),
            })
          }
          className="w-[200px]"
        />
      );
    }

    return (
      <Input
        placeholder="Enter value"
        value={filter.value as string}
        onChange={(e) => updateFilter(index, { value: e.target.value })}
        className="w-[200px]"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Filter Rules</h4>
        <Button type="button" variant="outline" size="sm" onClick={addFilter}>
          <Plus className="mr-2 h-4 w-4" />
          Add Filter
        </Button>
      </div>

      {filters.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          No filters added. Click &quot;Add Filter&quot; to define dynamic list criteria.
        </p>
      )}

      {filters.map((filter, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-md border p-3"
        >
          {index > 0 && (
            <span className="text-xs font-medium text-muted-foreground mr-1">
              AND
            </span>
          )}

          <Select
            value={filter.field}
            onValueChange={(value) => updateFilter(index, { field: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.operator}
            onValueChange={(value) =>
              updateFilter(index, {
                operator: value as ContactListFilter['operator'],
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {renderValueInput(filter, index)}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeFilter(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
