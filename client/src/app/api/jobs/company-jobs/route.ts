import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Job from '@/models/Job';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        
        // Authenticate user
        const user = await getUserFromToken(req);
        if (!user || user.role !== 'Company') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        // Fetch company's jobs
        const jobs = await Job.find({ companyId: user.id });
        
        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching company jobs:', error);
        return NextResponse.json({ message: 'Failed to fetch jobs' }, { status: 500 });
    }
}