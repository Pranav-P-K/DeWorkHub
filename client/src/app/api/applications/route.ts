import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { getUserFromToken } from '@/lib/auth';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Authenticate user
        const user = await getUserFromToken(req);
        if (!user || user.role !== 'Freelancer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get form data
        const formData = await req.formData();
        const jobId = formData.get('jobId') as string;
        const coverLetter = formData.get('coverLetter') as string;
        const resumeFile = formData.get('resume') as File;

        if (!jobId || !resumeFile) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            jobId,
            freelancerId: user.id
        });

        if (existingApplication) {
            return NextResponse.json({ message: 'You have already applied for this job' }, { status: 400 });
        }

        // Store the resume file
        const bytes = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create directory structure if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const uniqueFilename = `${user.id}-${jobId}-${Date.now()}-${resumeFile.name}`;
        const filePath = join(uploadDir, uniqueFilename);
        
        // Write file to filesystem
        await writeFile(filePath, buffer);
        
        // Store relative path in DB
        const resumePath = `/uploads/resumes/${uniqueFilename}`;

        // Create application record
        const application = new Application({
            jobId,
            freelancerId: user.id,
            coverLetter,
            resumePath,
            status: 'applied'
        });

        await application.save();

        // Update job's applicants array
        await Job.findByIdAndUpdate(jobId, {
            $addToSet: { applicants: user.id }
        });

        return NextResponse.json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json({ message: 'Failed to submit application' }, { status: 500 });
    }
}