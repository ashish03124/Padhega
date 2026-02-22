import type { Metadata } from 'next';
import StudyRoomsClient from './StudyRoomsClient';

export const metadata: Metadata = {
    title: 'Study Rooms - Padhega',
    description: 'Join or create a collaborative study session with other students.',
};

export default function StudyRoomsPage() {
    return <StudyRoomsClient />;
}
