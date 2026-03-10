'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TemplateEditor } from './template-editor';
import {
  createEmailTemplate,
  updateEmailTemplate,
  type EmailTemplate,
} from '@/lib/api/email-templates';

const templateSchema = z.object({
  name: z.string().min(1, 'Le nom du modèle est requis').max(255),
  subject: z.string().min(1, 'La ligne d\'objet est requise').max(998),
  htmlContent: z.string().min(1, 'Le contenu HTML est requis'),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  initialData?: EmailTemplate;
}

export function TemplateForm({ initialData }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || '',
      subject: initialData?.subject || '',
      htmlContent: initialData?.htmlContent || '',
    },
  });

  async function onSubmit(data: TemplateFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateEmailTemplate(initialData.id, data);
        toast.success('Modèle mis à jour');
      } else {
        await createEmailTemplate(data);
        toast.success('Modèle créé');
      }
      router.push('/marketing/templates');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Échec de la sauvegarde du modèle';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Modifier le modèle' : 'Créer un modèle'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Mettez à jour votre modèle d\'e-mail.'
                : 'Concevez un nouveau modèle d\'e-mail avec du contenu HTML et des variables de personnalisation.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du modèle</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex. E-mail de bienvenue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ligne d&apos;objet</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex. Bienvenue sur notre plateforme, {{contact.firstName}} !"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contenu de l&apos;e-mail</CardTitle>
            <CardDescription>
              Rédigez le contenu HTML de votre e-mail. Utilisez l&apos;outil d&apos;insertion de variables pour ajouter
              des jetons de personnalisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="htmlContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TemplateEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Sauvegarde...'
              : isEditing
                ? 'Mettre à jour le modèle'
                : 'Créer le modèle'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/marketing/templates')}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
