'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { createDefinition } from '@/lib/api/custom-properties';

const schema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire').max(100).regex(/^[a-z][a-z0-9_]*$/, 'Lettres minuscules, chiffres et underscores uniquement'),
  label: z.string().min(1, 'Le libellé est obligatoire').max(200),
  fieldType: z.enum(['TEXT', 'NUMBER', 'DATE', 'DROPDOWN']),
  entityType: z.enum(['CONTACT', 'COMPANY']),
  isRequired: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface PropertyDefinitionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function PropertyDefinitionForm({
  open,
  onOpenChange,
  onCreated,
}: PropertyDefinitionFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      label: '',
      fieldType: 'TEXT',
      entityType: 'CONTACT',
      isRequired: false,
    },
  });

  const fieldType = form.watch('fieldType');

  function addOption() {
    const trimmed = optionInput.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setOptionInput('');
    }
  }

  function removeOption(opt: string) {
    setOptions(options.filter((o) => o !== opt));
  }

  async function onSubmit(values: FormValues) {
    if (values.fieldType === 'DROPDOWN' && options.length === 0) {
      toast.error('Ajoutez au moins une option pour la liste déroulante');
      return;
    }

    setSubmitting(true);
    try {
      await createDefinition({
        ...values,
        options: values.fieldType === 'DROPDOWN' ? options : undefined,
      });
      toast.success('Propriété créée');
      form.reset();
      setOptions([]);
      onOpenChange(false);
      onCreated();
    } catch {
      toast.error('Échec de la création de la propriété');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Nouvelle propriété personnalisée</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="label">Libellé</Label>
              <Input id="label" {...form.register('label')} placeholder="Taille de l'entreprise" />
              {form.formState.errors.label && (
                <p className="text-sm text-destructive">{form.formState.errors.label.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom (clé)</Label>
              <Input id="name" {...form.register('name')} placeholder="taille_entreprise" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de champ</Label>
              <Select value={fieldType} onValueChange={(v) => form.setValue('fieldType', v as FormValues['fieldType'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Texte</SelectItem>
                  <SelectItem value="NUMBER">Nombre</SelectItem>
                  <SelectItem value="DATE">Date</SelectItem>
                  <SelectItem value="DROPDOWN">Liste déroulante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type d'entité</Label>
              <Select
                value={form.watch('entityType')}
                onValueChange={(v) => form.setValue('entityType', v as FormValues['entityType'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTACT">Contact</SelectItem>
                  <SelectItem value="COMPANY">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {fieldType === 'DROPDOWN' && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex gap-2">
                <Input
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                  placeholder="Ajouter une option..."
                />
                <Button type="button" variant="outline" onClick={addOption}>Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {options.map((opt) => (
                  <Badge key={opt} variant="secondary" className="gap-1">
                    {opt}
                    <button type="button" onClick={() => removeOption(opt)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="isRequired"
              checked={form.watch('isRequired')}
              onCheckedChange={(checked) => form.setValue('isRequired', !!checked)}
            />
            <Label htmlFor="isRequired">Champ obligatoire</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Création...' : 'Créer la propriété'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
