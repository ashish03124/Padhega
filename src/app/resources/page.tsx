import type { Metadata } from 'next';
import ResourcesClient from './ResourcesClient';

export const metadata: Metadata = {
    title: 'Padhega - Learning Resources',
    description: 'AI-powered learning resources and video tutorials',
};

export default function ResourcesPage() {
    return <ResourcesClient />;
}
