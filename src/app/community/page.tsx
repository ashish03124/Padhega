import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community Discussions | Padhega - Learn Together',
  description: 'Ask questions, share advice, discuss subjects, upvote helpful threads, and build study circles with fellow students on the Padhega community forum.',
  openGraph: {
    title: 'Student Community & Discussion Forum | Padhega',
    description: 'Ask questions, share advice, discuss subjects, upvote helpful threads, and build study circles with fellow students on the Padhega community forum.',
    url: 'https://padhega.vercel.app/community',
    siteName: 'Padhega',
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 600,
        alt: 'Padhega Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Community & Discussion Forum | Padhega',
    description: 'Ask questions, share advice, discuss subjects, upvote helpful threads, and build study circles with fellow students on the Padhega community forum.',
    images: ['/images/logo.png'],
  },
};

export default function CommunityPage() {
  return <CommunityClient />;
}