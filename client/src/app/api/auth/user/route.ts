import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

const SECRET_KEY = process.env.JWT_SECRET || '123-456-7890';

export async function GET(req: NextRequest) {
    try {
      const authHeader = req.headers.get('Authorization');
      console.log('Authorization Header:', authHeader); // Debugging
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }
  
      const token = authHeader.split(' ')[1];
      console.log('Extracted Token:', token); // Debugging
  
      // Verify the token
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
      console.log('Decoded Token:', decoded); // Debugging
  
      if (!decoded?.email) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
  
      await connectToDatabase();
  
      const user = await User.findOne({ email: decoded.email }).select('name email role profilePicture');
  
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.error('Auth Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  