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
  name: z.string().min(1, 'Template name is required').max(255),
  subject: z.string().min(1, 'Subject line is required').max(998),
  htmlContent: z.string().min(1, 'HTML content is required'),
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
        toast.success('Template updated');
      } else {
        await createEmailTemplate(data);
        toast.success('Template created');
      }
      router.push('/marketing/templates');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save template';
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
              {isEditing ? 'Edit Template' : 'Create Template'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update your email template.'
                : 'Design a new email template with HTML content and personalization variables.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Welcome Email"
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
                  <FormLabel>Subject Line</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Welcome to our platform, {{contact.firstName}}!"
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
            <CardTitle className="text-lg">Email Content</CardTitle>
            <CardDescription>
              Write HTML content for your email. Use the variable inserter to add
              personalization tokens.
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
              ? 'Saving...'
              : isEditing
                ? 'Update Template'
                : 'Create Template'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/marketing/templates')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
