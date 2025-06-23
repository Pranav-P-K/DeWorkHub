import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

const SECRET_KEY = process.env.JWT_SECRET || '123-456-7890';

export async function GET(req: NextRequest) {
    try {
      const authHeader = req.headers.get('Authorization');
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }
  
      const token = authHeader.split(' ')[1];
  
      // Verify the token
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
  
      if (!decoded?.email) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
  
      await connectToDatabase();
  
      const user = await User.findOne({ email: decoded.email }).select('-password');
  
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error('Auth Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

export async function PUT(req: NextRequest) {
    try {
      const authHeader = req.headers.get('Authorization');
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }
  
      const token = authHeader.split(' ')[1];
  
      // Verify the token
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
  
      if (!decoded?.email) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
  
      await connectToDatabase();
  
      const user = await User.findOne({ email: decoded.email });
  
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      const body = await req.json();
      
      // Update allowed fields
      const allowedFields = ['name', 'bio', 'skills', 'experience', 'companyName', 'profilePicture', 'walletAddress'];
      const updateData: any = {};
      
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      });
  
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
  
      return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error) {
      console.error('Update Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  