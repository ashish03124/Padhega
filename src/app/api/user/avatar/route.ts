import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');

        if (!id) {
            return new NextResponse('Missing user ID', { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findById(id).select('image');

        if (!user || !user.image) {
            return new NextResponse('Not found', { status: 404 });
        }

        // If it's already a URL (e.g. from Google/Github auth), redirect to it
        if (user.image.startsWith('http')) {
            return NextResponse.redirect(user.image);
        }

        // Handle Base64 Data URL (data:image/jpeg;base64,... )
        if (user.image.startsWith('data:image')) {
            const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                return new NextResponse('Invalid image format', { status: 400 });
            }

            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        return new NextResponse('Invalid image format', { status: 400 });

    } catch (error) {
        console.error('Error fetching avatar:', error);
        return new NextResponse('Internal error', { status: 500 });
    }
}
