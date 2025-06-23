import { ethers } from 'ethers';

// TypeScript declarations for ethereum window object
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract ABI - you'll need to update this with your actual contract ABI
const JOB_ESCROW_ABI = [
  "function postJob() public",
  "function hireFreelancer(uint256 _jobId, address payable _freelancer) public payable",
  "function completeJob(uint256 _jobId, uint256 _rating, string memory _metadataURI) public",
  "function raiseDispute(uint256 _jobId) public",
  "function resolveDispute(uint256 _jobId, bool decision) public",
  "function jobs(uint256) public view returns (uint256 id, address employer, address payable freelancer, uint256 budget, bool isHired, bool isCompleted, bool isDisputed)",
  "function jobCounter() public view returns (uint256)",
  "event JobPosted(uint256 jobId, address employer)",
  "event FreelancerHired(uint256 jobId, address freelancer, uint256 budget)",
  "event JobCompleted(uint256 jobId, uint256 rating)",
  "event PaymentReleased(uint256 jobId, address freelancer, uint256 amount)",
  "event DisputeRaised(uint256 jobId)",
  "event DisputeResolved(uint256 jobId, bool decision)"
];

const REPUTATION_NFT_ABI = [
  "function issueReputationNFT(address _freelancer, string memory _metadataURI) public",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];

// Contract addresses - update these with your deployed contract addresses
const JOB_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_JOB_ESCROW_ADDRESS || '';
const REPUTATION_NFT_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS || '';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private jobEscrowContract: ethers.Contract | null = null;
  private reputationNFTContract: ethers.Contract | null = null;

  async connectWallet(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Initialize contracts
        this.jobEscrowContract = new ethers.Contract(
          JOB_ESCROW_ADDRESS,
          JOB_ESCROW_ABI,
          this.signer
        );
        
        this.reputationNFTContract = new ethers.Contract(
          REPUTATION_NFT_ADDRESS,
          REPUTATION_NFT_ABI,
          this.signer
        );

        const address = await this.signer.getAddress();
        return address;
      } else {
        throw new Error('MetaMask not found');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.jobEscrowContract = null;
    this.reputationNFTContract = null;
  }

  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async postJob(): Promise<boolean> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const tx = await this.jobEscrowContract.postJob();
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error posting job:', error);
      return false;
    }
  }

  async hireFreelancer(jobId: number, freelancerAddress: string, budget: string): Promise<boolean> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const tx = await this.jobEscrowContract.hireFreelancer(
        jobId,
        freelancerAddress,
        { value: ethers.parseEther(budget) }
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      return false;
    }
  }

  async completeJob(jobId: number, rating: number, metadataURI: string): Promise<boolean> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const tx = await this.jobEscrowContract.completeJob(jobId, rating, metadataURI);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing job:', error);
      return false;
    }
  }

  async getJobDetails(jobId: number): Promise<any> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const job = await this.jobEscrowContract.jobs(jobId);
      return {
        id: job.id.toString(),
        employer: job.employer,
        freelancer: job.freelancer,
        budget: ethers.formatEther(job.budget),
        isHired: job.isHired,
        isCompleted: job.isCompleted,
        isDisputed: job.isDisputed
      };
    } catch (error) {
      console.error('Error getting job details:', error);
      return null;
    }
  }

  async getReputationNFTs(address: string): Promise<any[]> {
    try {
      if (!this.reputationNFTContract) throw new Error('Contract not initialized');
      
      const balance = await this.reputationNFTContract.balanceOf(address);
      const nfts = [];
      
      for (let i = 0; i < balance; i++) {
        const tokenId = await this.reputationNFTContract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await this.reputationNFTContract.tokenURI(tokenId);
        nfts.push({ tokenId: tokenId.toString(), tokenURI });
      }
      
      return nfts;
    } catch (error) {
      console.error('Error getting reputation NFTs:', error);
      return [];
    }
  }

  async getJobCounter(): Promise<number> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const counter = await this.jobEscrowContract.jobCounter();
      return parseInt(counter.toString());
    } catch (error) {
      console.error('Error getting job counter:', error);
      return 0;
    }
  }

  async raiseDispute(jobId: number): Promise<boolean> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const tx = await this.jobEscrowContract.raiseDispute(jobId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error raising dispute:', error);
      return false;
    }
  }

  async resolveDispute(jobId: number, decision: boolean): Promise<boolean> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const tx = await this.jobEscrowContract.resolveDispute(jobId, decision);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      return false;
    }
  }

  async getJobStatus(jobId: number): Promise<any> {
    try {
      if (!this.jobEscrowContract) throw new Error('Contract not initialized');
      
      const job = await this.jobEscrowContract.jobs(jobId);
      return {
        id: job.id.toString(),
        employer: job.employer,
        freelancer: job.freelancer,
        budget: ethers.formatEther(job.budget),
        isHired: job.isHired,
        isCompleted: job.isCompleted,
        isDisputed: job.isDisputed
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }
}

export const web3Service = new Web3Service(); 