import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Extract jobId from the request URL
        const pathname = req.nextUrl.pathname;
        const jobId = pathname.split('/').pop(); // Get last part of URL

        if (!jobId) {
            return NextResponse.json({ message: 'Invalid job ID' }, { status: 400 });
        }

        // Authenticate user
        const user = await getUserFromToken(req);
        if (!user || user.role !== 'Company') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Verify the job belongs to this company
        const job = await Job.findOne({ _id: jobId, companyId: user.id });
        if (!job) {
            return NextResponse.json({ message: 'Job not found or unauthorized' }, { status: 404 });
        }

        // Fetch applications for this job
        const applications = await Application.find({ jobId })
            .populate('freelancerId', 'name email')
            .populate('jobId', 'title');

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching job applications:', error);
        return NextResponse.json({ message: 'Failed to fetch applications' }, { status: 500 });
    }
}