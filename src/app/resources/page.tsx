import type { Metadata } from 'next';
import ResourcesClient from './ResourcesClient';

export const metadata: Metadata = {
    title: 'Learning Resources | Padhega - AI Notes & Tools',
    description: 'Explore AI-powered learning resources, formatting templates, and video tutorials. Generate custom summaries, flashcards, and quizzes using AI to boost your retention.',
    openGraph: {
        title: 'AI-Powered Learning Resources | Padhega',
        description: 'Explore AI-powered learning resources, formatting templates, and video tutorials. Generate custom summaries, flashcards, and quizzes using AI to boost your retention.',
        url: 'https://padhega.vercel.app/resources',
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
        title: 'AI-Powered Learning Resources | Padhega',
        description: 'Explore AI-powered learning resources, formatting templates, and video tutorials. Generate custom summaries, flashcards, and quizzes using AI to boost your retention.',
        images: ['/images/logo.png'],
    },
};

export default function ResourcesPage() {
    return <ResourcesClient />;
}
