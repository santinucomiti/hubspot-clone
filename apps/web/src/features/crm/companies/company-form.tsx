'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCompany, updateCompany, type Company } from '@/lib/api/companies';

const companySchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entreprise est obligatoire').max(200),
  domain: z.string().max(200).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  size: z.string().max(50).optional().or(z.literal('')),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: Company;
}

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter();
  const isEditing = !!company;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name ?? '',
      domain: company?.domain ?? '',
      industry: company?.industry ?? '',
      size: company?.size ?? '',
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      const data = {
        ...values,
        domain: values.domain || undefined,
        industry: values.industry || undefined,
        size: values.size || undefined,
      };
      if (isEditing) {
        await updateCompany(company.id, data);
        toast.success('Entreprise mise à jour');
        router.push(`/companies/${company.id}`);
      } else {
        const created = await createCompany(data);
        toast.success('Entreprise créée avec succès');
        router.push(`/companies/${created.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const message = error?.response?.data?.error?.message || 'Une erreur est survenue';
      toast.error(message);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Modifier l\'entreprise' : 'Créer une entreprise'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'entreprise</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="domain" render={({ field }) => (
              <FormItem>
                <FormLabel>Domaine</FormLabel>
                <FormControl><Input placeholder="exemple.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="industry" render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d'activité</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="size" render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille</FormLabel>
                  <FormControl><Input placeholder="ex. 1-10, 11-50, 51-200" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour l\'entreprise' : 'Créer l\'entreprise'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
