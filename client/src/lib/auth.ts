import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || '123-456-7890';

export const getUserFromToken = async (req: NextRequest) => {
  try {
    await connectToDatabase(); // Ensure DB connection

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1]; // Extract token
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; email: string; role: string };

    if (!decoded?.id) return null;

    const user = await User.findById(decoded.id).select('-password'); // Fetch user without password
    return user;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
