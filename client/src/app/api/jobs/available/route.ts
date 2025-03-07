/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Job from '@/models/Job';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        
        // Only fetch jobs with 'open' status
        const jobs = await Job.find({ status: 'open' })
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });
            
        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        return NextResponse.json({ message: 'Failed to fetch jobs' }, { status: 500 });
    }
}