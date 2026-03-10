'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  listDefinitions,
  getValues,
  setValue,
  type CustomPropertyDefinition,
  type CustomPropertyValue,
} from '@/lib/api/custom-properties';

interface CustomFieldsProps {
  entityType: 'CONTACT' | 'COMPANY';
  entityId: string;
  readOnly?: boolean;
}

export function CustomFields({ entityType, entityId, readOnly = false }: CustomFieldsProps) {
  const [definitions, setDefinitions] = useState<CustomPropertyDefinition[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [defsResult, valsResult] = await Promise.all([
        listDefinitions(entityType),
        getValues(entityType, entityId),
      ]);
      setDefinitions(defsResult.data);
      const valMap: Record<string, string> = {};
      valsResult.forEach((v: CustomPropertyValue) => {
        valMap[v.definitionId] = v.value;
      });
      setValues(valMap);
    } catch {
      // Silently fail — custom properties are optional UI
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleChange(definitionId: string, newValue: string) {
    setValues((prev) => ({ ...prev, [definitionId]: newValue }));

    if (readOnly) return;
    setSaving(definitionId);
    try {
      await setValue({
        definitionId,
        entityType,
        entityId,
        value: newValue,
      });
    } catch {
      toast.error('Failed to save property');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (definitions.length === 0) return null;

  return (
    <div className="space-y-3">
      {definitions.map((def) => (
        <CustomField
          key={def.id}
          definition={def}
          value={values[def.id] || ''}
          onChange={(v) => handleChange(def.id, v)}
          disabled={readOnly || saving === def.id}
        />
      ))}
    </div>
  );
}

interface CustomFieldProps {
  definition: CustomPropertyDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function CustomField({ definition, value, onChange, disabled }: CustomFieldProps) {
  const { fieldType, label, options, isRequired } = definition;

  return (
    <div className="space-y-1">
      <Label className="text-sm">
        {label}
        {isRequired && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      {fieldType === 'TEXT' && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}

      {fieldType === 'NUMBER' && (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="0"
        />
      )}

      {fieldType === 'DATE' && (
        <Input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}

      {fieldType === 'DROPDOWN' && options && (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(options as string[]).map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
