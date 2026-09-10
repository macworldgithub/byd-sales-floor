import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://creative-basbousa-ab1bf0.netlify.app'),
  title: 'BYD Melbourne CBD · Sales Floor',
  description: 'Interactive UI/UX operating system for the BYD Harmony Sales Floor App.',
  keywords: ['BYD', 'Melbourne CBD', 'Sales Floor', 'EV', 'SEALION 7', 'SEAL', 'ATTO 3', 'Harmony Auto'],
  authors: [{ name: 'Harmony Auto Group' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/images/official-byd-melbourne-cbd-lockup.png',
    apple: '/images/official-byd-melbourne-cbd-lockup.png',
  },
  openGraph: {
    type: 'website',
    title: 'BYD Melbourne CBD · Sales Floor',
    description: 'Interactive UI/UX operating system for the BYD Harmony Sales Floor App.',
    url: 'https://creative-basbousa-ab1bf0.netlify.app/',
    siteName: 'BYD Melbourne CBD',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BYD Melbourne CBD Sales Floor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BYD Melbourne CBD · Sales Floor',
    description: 'Interactive UI/UX operating system for the BYD Harmony Sales Floor App.',
    images: ['/images/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#171b22',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
