# DeWorkHub - Web3 Freelancing Platform

A decentralized freelancing platform that combines traditional web2 features with blockchain technology for secure, trustless job transactions.

## Features

### Web2 Features
- User authentication and profiles
- Job posting and applications
- Real-time chat
- Rating and review system
- Dashboard for freelancers and companies

### Web3 Features
- Smart contract-based job escrow
- Reputation NFTs for freelancers
- Decentralized payment processing
- Immutable job records on blockchain
- Wallet integration with MetaMask

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Ethers.js** - Web3 integration

### Backend
- **Next.js API Routes** - Server-side logic
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### Blockchain
- **Solidity** - Smart contracts
- **Hardhat** - Development framework
- **OpenZeppelin** - Security libraries

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the client directory:

```env
# Web3 Configuration
NEXT_PUBLIC_JOB_ESCROW_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x0000000000000000000000000000000000000000

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Deploy Smart Contracts

1. Navigate to the root directory:
```bash
cd ..
```

2. Install Hardhat dependencies:
```bash
npm install
```

3. Compile contracts:
```bash
npx hardhat compile
```

4. Deploy to your preferred network:
```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

5. Update the contract addresses in `.env.local` with the deployed addresses.

### 4. Run the Application

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:3000`

## Smart Contracts

### JobEscrow.sol
Main contract that handles:
- Job posting
- Freelancer hiring
- Payment escrow
- Job completion
- Dispute resolution

### ReputationNFT.sol
ERC721 contract for:
- Issuing reputation tokens to freelancers
- Tracking completed work
- Building on-chain reputation

## Web3 Integration

### Wallet Connection
Users can connect their MetaMask wallet to:
- Post jobs on the blockchain
- Hire freelancers with escrow
- Complete jobs and release payments
- View reputation NFTs

### Key Functions
- `postJob()` - Create a job on the blockchain
- `hireFreelancer()` - Lock payment in escrow
- `completeJob()` - Release payment and issue reputation NFT
- `getReputationNFTs()` - Fetch user's reputation tokens

## File Structure

```
client/
├── src/
│   ├── app/
│   │   ├── profile/          # User profile page with Web3 integration
│   │   ├── api/              # API routes
│   │   └── ...
│   ├── components/
│   │   ├── Web3JobIntegration.tsx  # Web3 job interactions
│   │   ├── PostJobs.tsx      # Job posting with Web3
│   │   └── ...
│   ├── lib/
│   │   ├── web3.ts           # Web3 service and contract interactions
│   │   └── ...
│   └── models/               # MongoDB models
├── contracts/
│   └── JobEscrow.sol         # Smart contracts
└── ...
```

## Usage

### For Companies
1. Register and connect wallet
2. Post jobs (Web2 + optional Web3)
3. Review applications
4. Hire freelancers (Web3 escrow)
5. Complete jobs and release payments

### For Freelancers
1. Register and connect wallet
2. Browse available jobs
3. Apply for positions
4. Complete work
5. Receive payments and reputation NFTs

## Security Features

- Smart contract escrow for secure payments
- Reputation system with on-chain verification
- Dispute resolution through DAO governance
- Immutable job records
- Wallet-based authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
