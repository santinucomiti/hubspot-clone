'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Lock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  type TicketComment,
  addTicketComment,
} from '@/lib/api/tickets';

const commentSchema = z.object({
  body: z.string().min(1, 'Le commentaire ne peut pas être vide'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface TicketCommentsProps {
  ticketId: string;
  comments: TicketComment[];
  onCommentAdded: (comment: TicketComment) => void;
}

export function TicketComments({
  ticketId,
  comments,
  onCommentAdded,
}: TicketCommentsProps) {
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const onSubmit = async (values: CommentFormValues) => {
    setIsSubmitting(true);
    try {
      const comment = await addTicketComment(ticketId, {
        body: values.body,
        isInternal,
      });
      onCommentAdded(comment);
      form.reset();
      toast.success(isInternal ? 'Note interne ajoutée' : 'Réponse ajoutée');
    } catch {
      toast.error('Échec de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" />
        Conversation ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun commentaire pour le moment. Commencez la conversation ci-dessous.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                'rounded-lg border p-4',
                comment.isInternal && 'border-amber-200 bg-amber-50/50',
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {comment.author.firstName[0]}
                    {comment.author.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.author.firstName} {comment.author.lastName}
                    </span>
                    {comment.isInternal && (
                      <Badge
                        variant="outline"
                        className="border-amber-300 bg-amber-100 text-amber-800 text-xs"
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Interne
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Separator />

      {/* New comment form */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isInternal ? 'outline' : 'default'}
            size="sm"
            onClick={() => setIsInternal(false)}
          >
            Réponse publique
          </Button>
          <Button
            type="button"
            variant={isInternal ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsInternal(true)}
            className={isInternal ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            <Lock className="mr-1 h-3 w-3" />
            Note interne
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isInternal
                          ? 'Écrire une note interne (visible uniquement par l\'équipe)...'
                          : 'Écrire une réponse...'
                      }
                      className={cn(
                        'min-h-[100px]',
                        isInternal && 'border-amber-200 bg-amber-50/30',
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} size="sm">
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? 'Envoi en cours...'
                  : isInternal
                    ? 'Ajouter une note interne'
                    : 'Envoyer la réponse'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
