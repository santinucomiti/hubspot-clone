'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getEmailTemplates, type EmailTemplate } from '@/lib/api/email-templates';
import { getContactLists, type ContactList } from '@/lib/api/contact-lists';
import { createCampaign, sendCampaign } from '@/lib/api/campaigns';

const STEPS = [
  { title: 'Template', description: 'Select an email template' },
  { title: 'Details', description: 'Customize subject and sender' },
  { title: 'Recipients', description: 'Choose contact lists' },
  { title: 'Preview', description: 'Review and send' },
];

const campaignDetailsSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  subject: z.string().min(1, 'Subject is required').max(998),
  fromName: z.string().min(1, 'Sender name is required').max(255),
  fromEmail: z.string().email('Valid email required'),
});

type CampaignDetailsValues = z.infer<typeof campaignDetailsSchema>;

export function CampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Template selection
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Step 3: List selection
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

  // Step 4: Schedule
  const [scheduledAt, setScheduledAt] = useState('');

  const form = useForm<CampaignDetailsValues>({
    resolver: zodResolver(campaignDetailsSchema),
    defaultValues: {
      name: '',
      subject: '',
      fromName: '',
      fromEmail: '',
    },
  });

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await getEmailTemplates({ limit: 100 });
      setTemplates(response.data);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const fetchLists = useCallback(async () => {
    try {
      const response = await getContactLists({ limit: 100 });
      setContactLists(response.data);
    } catch {
      toast.error('Failed to load contact lists');
    } finally {
      setListsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchLists();
  }, [fetchTemplates, fetchLists]);

  // Auto-fill subject from template
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template && !form.getValues('subject')) {
        form.setValue('subject', template.subject);
      }
    }
  }, [selectedTemplateId, templates, form]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  function canProceed(): boolean {
    switch (currentStep) {
      case 0:
        return !!selectedTemplateId;
      case 1:
        return form.formState.isValid;
      case 2:
        return selectedListIds.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    if (currentStep === 1) {
      form.trigger().then((isValid) => {
        if (isValid) setCurrentStep((s) => s + 1);
      });
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    setCurrentStep((s) => s - 1);
  }

  function toggleList(listId: string) {
    setSelectedListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId],
    );
  }

  async function handleSend(schedule: boolean) {
    const details = form.getValues();
    setIsSubmitting(true);
    try {
      const campaign = await createCampaign({
        name: details.name,
        subject: details.subject,
        fromName: details.fromName,
        fromEmail: details.fromEmail,
        templateId: selectedTemplateId!,
        contactListIds: selectedListIds,
      });

      await sendCampaign(
        campaign.id,
        schedule && scheduledAt ? scheduledAt : undefined,
      );

      toast.success(
        schedule
          ? 'Campaign scheduled successfully'
          : 'Campaign sent successfully',
      );
      router.push('/marketing/campaigns');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send campaign';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <nav className="flex items-center justify-center">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index < currentStep
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                  {index + 1}
                </span>
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px w-8',
                  index < currentStep ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step 1: Select Template */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Email Template</CardTitle>
            <CardDescription>
              Choose a template for your campaign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Loading templates...
              </p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No templates found. Please create a template first.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      'cursor-pointer rounded-lg border p-4 transition-colors hover:border-primary',
                      selectedTemplateId === template.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border',
                    )}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {template.subject}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Campaign Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Set the campaign name, subject line, and sender information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. March Newsletter"
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
                          placeholder="e.g. Exciting news, {{contact.firstName}}!"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Marketing Team" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="e.g. marketing@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Lists */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Contact Lists</CardTitle>
            <CardDescription>
              Choose one or more contact lists as recipients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listsLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Loading contact lists...
              </p>
            ) : contactLists.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No contact lists found. Please create a list first.
              </p>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {contactLists.map((list) => (
                    <div
                      key={list.id}
                      className={cn(
                        'flex items-center gap-3 rounded-md border p-4 cursor-pointer hover:border-primary transition-colors',
                        selectedListIds.includes(list.id)
                          ? 'border-primary bg-primary/5'
                          : '',
                      )}
                      onClick={() => toggleList(list.id)}
                    >
                      <Checkbox
                        checked={selectedListIds.includes(list.id)}
                        onCheckedChange={() => toggleList(list.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{list.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {list.type.toLowerCase()} list
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {list.type.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              {selectedListIds.length} list{selectedListIds.length !== 1 ? 's' : ''} selected
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview & Send */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
              <CardDescription>
                Review your campaign before sending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Campaign Name
                  </p>
                  <p className="text-sm font-medium">
                    {form.getValues('name')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Subject
                  </p>
                  <p className="text-sm">{form.getValues('subject')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    From
                  </p>
                  <p className="text-sm">
                    {form.getValues('fromName')} &lt;{form.getValues('fromEmail')}&gt;
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Template
                  </p>
                  <p className="text-sm">{selectedTemplate?.name || '-'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Recipient Lists
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedListIds.map((listId) => {
                    const list = contactLists.find((l) => l.id === listId);
                    return (
                      <Badge key={listId} variant="secondary">
                        {list?.name || listId}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Template preview */}
              {selectedTemplate && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Email Preview
                  </p>
                  <div className="rounded-md border bg-white p-4 max-h-[300px] overflow-y-auto">
                    <iframe
                      srcDoc={selectedTemplate.htmlContent}
                      className="w-full min-h-[250px] border-0"
                      sandbox="allow-same-origin"
                      title="Campaign email preview"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule option */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="scheduledAt"
                  className="text-sm font-medium"
                >
                  Schedule for later (optional)
                </label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1 max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to send immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/marketing/campaigns')}
          >
            Cancel
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              {scheduledAt && (
                <Button
                  variant="outline"
                  onClick={() => handleSend(true)}
                  disabled={isSubmitting}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Scheduling...' : 'Schedule'}
                </Button>
              )}
              <Button
                onClick={() => handleSend(false)}
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Now'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
