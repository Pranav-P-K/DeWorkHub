'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { web3Service } from '@/lib/web3';
import { UserCheck, DollarSign, Shield, CheckCircle } from 'lucide-react';

interface Web3HiringProps {
  jobId: string;
  jobDetails: any;
  freelancerAddress: string;
  freelancerName: string;
  budget: number;
  onHireSuccess?: () => void;
}

const Web3Hiring: React.FC<Web3HiringProps> = ({
  jobId,
  jobDetails,
  freelancerAddress,
  freelancerName,
  budget,
  onHireSuccess
}) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [escrowAmount, setEscrowAmount] = useState(budget.toString());

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

  const hireFreelancer = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!escrowAmount || parseFloat(escrowAmount) <= 0) {
      toast.error('Please enter a valid escrow amount');
      return;
    }

    setLoading(true);
    try {
      const success = await web3Service.hireFreelancer(
        parseInt(jobId),
        freelancerAddress,
        escrowAmount
      );
      
      if (success) {
        toast.success('Freelancer hired successfully! Payment locked in escrow.');
        onHireSuccess?.();
      } else {
        toast.error('Failed to hire freelancer');
      }
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      toast.error('Failed to hire freelancer');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleEscrowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setEscrowAmount(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6"
    >
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
          <UserCheck className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Hire Freelancer</h3>
      </div>

      {/* Job and Freelancer Details */}
      <div className="mb-6 space-y-4">
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-800 mb-3">Job Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{jobDetails.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget:</span>
              <span className="font-medium">${jobDetails.budget}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{jobDetails.companyName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-800 mb-3">Freelancer Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{freelancerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet Address:</span>
              <span className="font-mono text-xs">{freelancerAddress.slice(0, 6)}...{freelancerAddress.slice(-4)}</span>
            </div>
          </div>
        </div>
      </div>

      {!isWalletConnected ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Connect your wallet to hire this freelancer with secure escrow
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

          {/* Escrow Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escrow Amount (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                value={escrowAmount}
                onChange={handleEscrowChange}
                placeholder="Enter amount to lock in escrow"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                step="0.01"
                min="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">ETH</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This amount will be locked in escrow until the job is completed
            </p>
          </div>

          {/* Security Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Secure Escrow</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Payment is locked in smart contract</li>
                  <li>• Released only upon job completion</li>
                  <li>• Dispute resolution available if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {!showConfirmation ? (
            <motion.button
              onClick={() => setShowConfirmation(true)}
              disabled={loading || !escrowAmount || parseFloat(escrowAmount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              Review & Hire
            </motion.button>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Confirm Hiring</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• You will lock {escrowAmount} ETH in escrow</p>
                  <p>• Payment will be released upon job completion</p>
                  <p>• This action cannot be undone</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  onClick={hireFreelancer}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 'Processing...' : 'Confirm Hire'}
                </motion.button>
                <motion.button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Web3Hiring; 