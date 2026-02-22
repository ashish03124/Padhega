import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community - Padhega',
  description: 'Join the Padhega community to learn, share, and grow together.',
};

export default function CommunityPage() {
  return <CommunityClient />;
}