import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HubSpot Clone',
  description: 'Internal CRM, Marketing, Sales & Service platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
