'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { web3Service } from '@/lib/web3';
import { ethers } from 'ethers';

interface Web3JobIntegrationProps {
  jobId?: string;
  budget?: number;
  freelancerAddress?: string;
  onSuccess?: () => void;
  mode: 'post' | 'hire' | 'complete';
  jobDetails?: any;
  userRole?: 'Freelancer' | 'Company';
}

const Web3JobIntegration: React.FC<Web3JobIntegrationProps> = ({
  jobId,
  budget,
  freelancerAddress,
  onSuccess,
  mode,
  jobDetails,
  userRole
}) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [metadataURI, setMetadataURI] = useState('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const address = await web3Service.getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      const address = await web3Service.connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const postJobOnBlockchain = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const success = await web3Service.postJob();
      if (success) {
        toast.success('Job posted on blockchain successfully!');
        onSuccess?.();
      } else {
        toast.error('Failed to post job on blockchain');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job on blockchain');
    } finally {
      setLoading(false);
    }
  };

  const hireFreelancerOnBlockchain = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!jobId || !budget || !freelancerAddress) {
      toast.error('Missing required information');
      return;
    }

    setLoading(true);
    try {
      const success = await web3Service.hireFreelancer(
        parseInt(jobId),
        freelancerAddress,
        budget.toString()
      );
      if (success) {
        toast.success('Freelancer hired on blockchain successfully!');
        onSuccess?.();
      } else {
        toast.error('Failed to hire freelancer on blockchain');
      }
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      toast.error('Failed to hire freelancer on blockchain');
    } finally {
      setLoading(false);
    }
  };

  const completeJobOnBlockchain = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!jobId) {
      toast.error('Missing job ID');
      return;
    }

    setLoading(true);
    try {
      const success = await web3Service.completeJob(
        parseInt(jobId),
        rating,
        metadataURI || `https://api.deworkhub.com/jobs/${jobId}/metadata`
      );
      if (success) {
        toast.success('Job completed on blockchain successfully!');
        onSuccess?.();
      } else {
        toast.error('Failed to complete job on blockchain');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      toast.error('Failed to complete job on blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    switch (mode) {
      case 'post':
        postJobOnBlockchain();
        break;
      case 'hire':
        hireFreelancerOnBlockchain();
        break;
      case 'complete':
        completeJobOnBlockchain();
        break;
    }
  };

  const getActionButtonText = () => {
    switch (mode) {
      case 'post':
        return 'Post Job on Blockchain';
      case 'hire':
        return 'Hire on Blockchain';
      case 'complete':
        return 'Complete on Blockchain';
    }
  };

  const getActionDescription = () => {
    switch (mode) {
      case 'post':
        return 'Post this job on the blockchain to make it immutable and trustless';
      case 'hire':
        return 'Hire the freelancer on the blockchain and lock the payment in escrow';
      case 'complete':
        return 'Complete the job on the blockchain and release payment to freelancer';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6"
    >
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">⚡</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Web3 Integration</h3>
      </div>

      <p className="text-gray-600 mb-4">{getActionDescription()}</p>

      {/* Job Details Display */}
      {jobDetails && (
        <div className="mb-4 p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-800 mb-2">Job Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{jobDetails.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget:</span>
              <span className="font-medium">${jobDetails.budget}</span>
            </div>
            {jobDetails.companyName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{jobDetails.companyName}</span>
              </div>
            )}
            {freelancerAddress && (
              <div className="flex justify-between">
                <span className="text-gray-600">Freelancer:</span>
                <span className="font-mono text-xs">{freelancerAddress.slice(0, 6)}...{freelancerAddress.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isWalletConnected ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Connect your wallet to use Web3 features
            </p>
          </div>
          <motion.button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <p className="text-green-800 text-sm">
                Wallet connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
            </div>
          </div>

          {mode === 'complete' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5 stars)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metadata URI (optional)
                </label>
                <input
                  type="text"
                  value={metadataURI}
                  onChange={(e) => setMetadataURI(e.target.value)}
                  placeholder="https://api.deworkhub.com/jobs/123/metadata"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <motion.button
            onClick={handleAction}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Processing...' : getActionButtonText()}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default Web3JobIntegration; 