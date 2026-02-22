import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Padhega - Your Ultimate Study Companion',
  description: 'Boost your productivity with Pomodoro timers, collaborative study rooms, and organized learning resources.',
};

export default function HomePage() {
  return <HomeClient />;
}
