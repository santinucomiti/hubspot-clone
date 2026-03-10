'use client';

import Link from 'next/link';
import {
  List,
  FileText,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';

const sections = [
  {
    title: 'Contact Lists',
    description:
      'Organize your contacts into static or dynamic lists for targeted campaigns.',
    href: '/marketing/lists',
    icon: List,
  },
  {
    title: 'Email Templates',
    description:
      'Design reusable email templates with HTML content and personalization variables.',
    href: '/marketing/templates',
    icon: FileText,
  },
  {
    title: 'Campaigns',
    description:
      'Create, send, and track email marketing campaigns with detailed analytics.',
    href: '/marketing/campaigns',
    icon: Megaphone,
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing"
        description="Manage your email marketing — lists, templates, and campaigns."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:border-primary hover:shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
