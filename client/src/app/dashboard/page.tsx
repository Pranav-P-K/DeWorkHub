'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Jobs from '@/components/Jobs';
import PostJobs from '@/components/PostJobs';
import Hire from '@/components/Hire';
import axios from 'axios';

interface User {
  name: string;
  email: string;
  role: 'Freelancer' | 'Company';
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

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
        
        // Set default active tab based on user role
        if (res.data.user.role === 'Freelancer') {
          setActiveTab('jobs');
        } else if (res.data.user.role === 'Company') {
          setActiveTab('post');
        }
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

  const renderContent = () => {
    if (!user) return <p>Please log in</p>;
    
    if (user.role === 'Freelancer') {
      return <Jobs />;
    }
    
    if (user.role === 'Company') {
      if (activeTab === 'post') return <PostJobs />;
      if (activeTab === 'hire') return <Hire />;
    }
    
    return <p>No role assigned</p>;
  };

  return (
    <div>
      <Navbar />
      
      {user?.role === 'Company' && (
        <div className="bg-gray-100 py-3 px-6 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('post')}
              className={`px-4 py-2 ${
                activeTab === 'post' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800'
              } rounded-md`}
            >
              Post Jobs
            </button>
            <button
              onClick={() => setActiveTab('hire')}
              className={`px-4 py-2 ${
                activeTab === 'hire' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800'
              } rounded-md`}
            >
              Hire Talent
            </button>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;