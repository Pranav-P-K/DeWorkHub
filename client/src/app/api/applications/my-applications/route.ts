import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Application from '@/models/Application';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Authenticate user
        const user = await getUserFromToken(req);
        if (!user || user.role !== 'Freelancer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's applications
        const applications = await Application.find({ freelancerId: user.id })
            .populate({
                path: 'jobId',
                populate: {
                    path: 'companyId',
                    select: 'name'
                }
            });

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
    }
}