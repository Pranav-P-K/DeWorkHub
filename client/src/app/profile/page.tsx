'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { web3Service } from '@/lib/web3';
import axios from 'axios';
import Image from 'next/image';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Freelancer' | 'Company';
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  companyName?: string;
  walletAddress?: string;
  rating: number;
  createdAt: string;
}

interface ReputationNFT {
  tokenId: string;
  tokenURI: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [reputationNFTs, setReputationNFTs] = useState<ReputationNFT[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [] as string[],
    experience: '',
    companyName: '',
    profilePicture: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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
      setFormData({
        name: res.data.user.name || '',
        bio: res.data.user.bio || '',
        skills: res.data.user.skills || [],
        experience: res.data.user.experience || '',
        companyName: res.data.user.companyName || '',
        profilePicture: res.data.user.profilePicture || ''
      });

      // Check if wallet is already connected
      if (res.data.user.walletAddress) {
        setWalletAddress(res.data.user.walletAddress);
        setIsWalletConnected(true);
        await fetchReputationNFTs(res.data.user.walletAddress);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    setWalletLoading(true);
    try {
      const address = await web3Service.connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
        
        // Update user's wallet address in database
        const token = localStorage.getItem('token');
        if (token) {
          await axios.put('/api/auth/user', 
            { walletAddress: address },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        await fetchReputationNFTs(address);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await web3Service.disconnectWallet();
      setWalletAddress(null);
      setIsWalletConnected(false);
      setReputationNFTs([]);
      
      // Remove wallet address from database
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put('/api/auth/user', 
          { walletAddress: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const fetchReputationNFTs = async (address: string) => {
    try {
      const nfts = await web3Service.getReputationNFTs(address);
      setReputationNFTs(nfts);
    } catch (error) {
      console.error('Error fetching reputation NFTs:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.put('/api/auth/user', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const addSkill = () => {
    const newSkill = prompt('Enter a new skill:');
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full ring-4 ring-white"
                  />
                ) : (
                  <div className="w-30 h-30 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-blue-100 mt-1">{user.email}</p>
                <div className="flex items-center mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {user.role}
                  </span>
                  {user.rating > 0 && (
                    <div className="ml-4 flex items-center">
                      <span className="text-yellow-300">★</span>
                      <span className="ml-1">{user.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </motion.button>
            </div>
          </div>

          <div className="p-8">
            {/* Wallet Connection Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Web3 Wallet</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                {isWalletConnected ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Connected Wallet</p>
                      <p className="font-mono text-sm bg-gray-200 px-2 py-1 rounded mt-1">
                        {walletAddress}
                      </p>
                    </div>
                    <motion.button
                      onClick={disconnectWallet}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">No wallet connected</p>
                      <p className="text-xs text-gray-500 mt-1">Connect your wallet to use Web3 features</p>
                    </div>
                    <motion.button
                      onClick={connectWallet}
                      disabled={walletLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                      whileHover={{ scale: walletLoading ? 1 : 1.05 }}
                      whileTap={{ scale: walletLoading ? 1 : 0.95 }}
                    >
                      {walletLoading ? 'Connecting...' : 'Connect Wallet'}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Information</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {user.role === 'Freelancer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={addSkill}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Skill
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                        <textarea
                          value={formData.experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  {user.role === 'Company' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <motion.button
                      onClick={handleSaveProfile}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bio && (
                    <div>
                      <h3 className="font-medium text-gray-700">Bio</h3>
                      <p className="text-gray-600 mt-1">{user.bio}</p>
                    </div>
                  )}

                  {user.role === 'Freelancer' && user.skills && user.skills.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.role === 'Freelancer' && user.experience && (
                    <div>
                      <h3 className="font-medium text-gray-700">Experience</h3>
                      <p className="text-gray-600 mt-1">{user.experience}</p>
                    </div>
                  )}

                  {user.role === 'Company' && user.companyName && (
                    <div>
                      <h3 className="font-medium text-gray-700">Company</h3>
                      <p className="text-gray-600 mt-1">{user.companyName}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-gray-700">Member Since</h3>
                    <p className="text-gray-600 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reputation NFTs Section */}
            {isWalletConnected && user.role === 'Freelancer' && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reputation NFTs</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  {reputationNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reputationNFTs.map((nft, index) => (
                        <motion.div
                          key={nft.tokenId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg p-4 shadow-md"
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-white text-2xl">★</span>
                            </div>
                            <h3 className="font-medium text-gray-800">Reputation Token #{nft.tokenId}</h3>
                            <p className="text-sm text-gray-600 mt-1">Proof of completed work</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">★</span>
                      </div>
                      <p className="text-gray-600">No reputation NFTs yet</p>
                      <p className="text-sm text-gray-500 mt-1">Complete jobs to earn reputation tokens</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 