'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { web3Service } from '@/lib/web3';
import { AlertTriangle, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

interface Web3DisputeProps {
  jobId: string;
  jobStatus?: any;
  userRole: 'Freelancer' | 'Company';
  onDisputeRaised?: () => void;
  onDisputeResolved?: () => void;
}

const Web3Dispute: React.FC<Web3DisputeProps> = ({
  jobId,
  jobStatus,
  userRole,
  onDisputeRaised,
  onDisputeResolved
}) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentJobStatus, setCurrentJobStatus] = useState<any>(jobStatus);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionDecision, setResolutionDecision] = useState<boolean | null>(null);

  useEffect(() => {
    checkWalletConnection();
    if (jobId) {
      fetchJobStatus();
    }
  }, [jobId]);

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

  const fetchJobStatus = async () => {
    try {
      const status = await web3Service.getJobStatus(parseInt(jobId));
      setCurrentJobStatus(status);
    } catch (error) {
      console.error('Error fetching job status:', error);
    }
  };

  const raiseDispute = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userRole !== 'Company') {
      toast.error('Only employers can raise disputes');
      return;
    }

    setLoading(true);
    try {
      const success = await web3Service.raiseDispute(parseInt(jobId));
      if (success) {
        toast.success('Dispute raised successfully!');
        await fetchJobStatus();
        onDisputeRaised?.();
      } else {
        toast.error('Failed to raise dispute');
      }
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast.error('Failed to raise dispute');
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (resolutionDecision === null) {
      toast.error('Please select a resolution decision');
      return;
    }

    setLoading(true);
    try {
      const success = await web3Service.resolveDispute(parseInt(jobId), resolutionDecision);
      if (success) {
        const decision = resolutionDecision ? 'in favor of the freelancer' : 'in favor of the employer';
        toast.success(`Dispute resolved ${decision}!`);
        await fetchJobStatus();
        setShowResolveForm(false);
        setResolutionDecision(null);
        onDisputeResolved?.();
      } else {
        toast.error('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (currentJobStatus?.isDisputed) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (currentJobStatus?.isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (currentJobStatus?.isHired) {
      return <Clock className="w-5 h-5 text-blue-500" />;
    }
    return <Shield className="w-5 h-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (currentJobStatus?.isDisputed) {
      return 'Dispute Raised';
    }
    if (currentJobStatus?.isCompleted) {
      return 'Completed';
    }
    if (currentJobStatus?.isHired) {
      return 'In Progress';
    }
    return 'Posted';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6"
    >
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Dispute Resolution</h3>
      </div>

      {/* Job Status */}
      {currentJobStatus && (
        <div className="mb-4 p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 font-medium text-gray-700">
                Status: {getStatusText()}
              </span>
            </div>
            {currentJobStatus.budget && (
              <span className="text-sm text-gray-600">
                Budget: {currentJobStatus.budget} ETH
              </span>
            )}
          </div>
        </div>
      )}

      {!isWalletConnected ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Connect your wallet to manage disputes
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

          {/* Raise Dispute (Only for Companies) */}
          {userRole === 'Company' && currentJobStatus?.isHired && !currentJobStatus?.isCompleted && !currentJobStatus?.isDisputed && (
            <motion.button
              onClick={raiseDispute}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Processing...' : 'Raise Dispute'}
            </motion.button>
          )}

          {/* Dispute Resolution (DAO/Admin) */}
          {currentJobStatus?.isDisputed && (
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 font-medium">Dispute Active</p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  This job is currently under dispute resolution
                </p>
              </div>

              {!showResolveForm ? (
                <motion.button
                  onClick={() => setShowResolveForm(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Resolve Dispute
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Decision
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="resolution"
                          value="true"
                          checked={resolutionDecision === true}
                          onChange={() => setResolutionDecision(true)}
                          className="mr-2"
                        />
                        <span className="text-sm">Pay Freelancer (Release escrow)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="resolution"
                          value="false"
                          checked={resolutionDecision === false}
                          onChange={() => setResolutionDecision(false)}
                          className="mr-2"
                        />
                        <span className="text-sm">Refund Employer (Return escrow)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      onClick={resolveDispute}
                      disabled={loading || resolutionDecision === null}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? 'Processing...' : 'Confirm Resolution'}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowResolveForm(false);
                        setResolutionDecision(null);
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium"
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

          {/* Completed Job Status */}
          {currentJobStatus?.isCompleted && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Job Completed</p>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Payment has been released and reputation NFT issued
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Web3Dispute; 