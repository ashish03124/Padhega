import type { Metadata } from 'next';
import StatsClient from './StatsClient';

export const metadata: Metadata = {
  title: 'Your Stats - Padhega',
  description: 'Track your study progress, streaks, and learning analytics.',
};

export default function StatsPage() {
  return <StatsClient />;
}