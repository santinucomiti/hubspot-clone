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
  { title: 'Modèle', description: 'Sélectionner un modèle d\'e-mail' },
  { title: 'Détails', description: 'Personnaliser l\'objet et l\'expéditeur' },
  { title: 'Destinataires', description: 'Choisir les listes de contacts' },
  { title: 'Aperçu', description: 'Vérifier et envoyer' },
];

const campaignDetailsSchema = z.object({
  name: z.string().min(1, 'Le nom de la campagne est requis').max(255),
  subject: z.string().min(1, 'L\'objet est requis').max(998),
  fromName: z.string().min(1, 'Le nom de l\'expéditeur est requis').max(255),
  fromEmail: z.string().email('E-mail valide requis'),
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
      toast.error('Échec du chargement des modèles');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const fetchLists = useCallback(async () => {
    try {
      const response = await getContactLists({ limit: 100 });
      setContactLists(response.data);
    } catch {
      toast.error('Échec du chargement des listes de contacts');
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
          ? 'Campagne planifiée avec succès'
          : 'Campagne envoyée avec succès',
      );
      router.push('/marketing/campaigns');
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Échec de l\'envoi de la campagne';
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
            <CardTitle>Sélectionner un modèle d&apos;e-mail</CardTitle>
            <CardDescription>
              Choisissez un modèle pour votre campagne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Chargement des modèles...
              </p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucun modèle trouvé. Veuillez d&apos;abord créer un modèle.
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
            <CardTitle>Détails de la campagne</CardTitle>
            <CardDescription>
              Définissez le nom de la campagne, la ligne d&apos;objet et les informations de l&apos;expéditeur.
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
                      <FormLabel>Nom de la campagne</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ex. Newsletter de mars"
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
                          placeholder="ex. Des nouvelles passionnantes, {{contact.firstName}} !"
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
                        <FormLabel>Nom de l&apos;expéditeur</FormLabel>
                        <FormControl>
                          <Input placeholder="ex. Équipe marketing" {...field} />
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
                        <FormLabel>E-mail de l&apos;expéditeur</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ex. marketing@entreprise.com"
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
            <CardTitle>Sélectionner les listes de contacts</CardTitle>
            <CardDescription>
              Choisissez une ou plusieurs listes de contacts comme destinataires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {listsLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Chargement des listes de contacts...
              </p>
            ) : contactLists.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune liste de contacts trouvée. Veuillez d&apos;abord créer une liste.
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
                          liste {list.type === 'STATIC' ? 'statique' : 'dynamique'}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {list.type === 'STATIC' ? 'statique' : 'dynamique'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              {selectedListIds.length} liste{selectedListIds.length !== 1 ? 's' : ''} sélectionnée{selectedListIds.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview & Send */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la campagne</CardTitle>
              <CardDescription>
                Vérifiez votre campagne avant l&apos;envoi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Nom de la campagne
                  </p>
                  <p className="text-sm font-medium">
                    {form.getValues('name')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Objet
                  </p>
                  <p className="text-sm">{form.getValues('subject')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    De
                  </p>
                  <p className="text-sm">
                    {form.getValues('fromName')} &lt;{form.getValues('fromEmail')}&gt;
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Modèle
                  </p>
                  <p className="text-sm">{selectedTemplate?.name || '-'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Listes de destinataires
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
                    Aperçu de l&apos;e-mail
                  </p>
                  <div className="rounded-md border bg-white p-4 max-h-[300px] overflow-y-auto">
                    <iframe
                      srcDoc={selectedTemplate.htmlContent}
                      className="w-full min-h-[250px] border-0"
                      sandbox="allow-same-origin"
                      title="Aperçu de l'e-mail de la campagne"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule option */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options d&apos;envoi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="scheduledAt"
                  className="text-sm font-medium"
                >
                  Planifier pour plus tard (optionnel)
                </label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1 max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour envoyer immédiatement.
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
              Précédent
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/marketing/campaigns')}
          >
            Annuler
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Suivant
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
                  {isSubmitting ? 'Planification...' : 'Planifier'}
                </Button>
              )}
              <Button
                onClick={() => handleSend(false)}
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer maintenant'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
