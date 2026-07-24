import type { Metadata } from 'next';
import StatsClient from './StatsClient';

export const metadata: Metadata = {
  title: 'Your Analytics & Study Stats | Padhega',
  description: 'Track your study progress, Pomodoro session completion rate, daily active streaks, and XP points over time with visual learning charts and metrics.',
  openGraph: {
    title: 'Personal Learning Analytics & Stats | Padhega',
    description: 'Track your study progress, Pomodoro session completion rate, daily active streaks, and XP points over time with visual learning charts and metrics.',
    url: 'https://padhega.vercel.app/stats',
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
    title: 'Personal Learning Analytics & Stats | Padhega',
    description: 'Track your study progress, Pomodoro session completion rate, daily active streaks, and XP points over time with visual learning charts and metrics.',
    images: ['/images/logo.png'],
  },
};

export default function StatsPage() {
  return <StatsClient />;
}