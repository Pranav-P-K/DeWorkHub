'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Jobs from '@/components/Jobs';
import PostJobs from '@/components/PostJobs';
import axios from 'axios';

interface User {
  name: string;
  email: string;
  role: 'Freelancer' | 'Company';
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get('/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="p-6">
        {user?.role === 'Freelancer' ? <Jobs /> : user?.role === 'Company' ? <PostJobs /> : <p>No role assigned</p>}
      </div>
    </div>
  );
};

export default Dashboard;
