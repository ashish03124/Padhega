import type { Metadata } from 'next';
import StudyRoomsClient from './StudyRoomsClient';

export const metadata: Metadata = {
    title: 'Study Rooms | Padhega - Collaborative Study Sessions',
    description: 'Join or create a live virtual study room. Study together with other students in real-time using built-in Pomodoro timers, video calls, and ambient focus music.',
    openGraph: {
        title: 'Collaborative Study Rooms | Padhega',
        description: 'Join or create a live virtual study room. Study together with other students in real-time using built-in Pomodoro timers, video calls, and ambient focus music.',
        url: 'https://padhega.vercel.app/study-rooms',
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
        title: 'Collaborative Study Rooms | Padhega',
        description: 'Join or create a live virtual study room. Study together with other students in real-time using built-in Pomodoro timers, video calls, and ambient focus music.',
        images: ['/images/logo.png'],
    },
};

export default function StudyRoomsPage() {
    return <StudyRoomsClient />;
}
