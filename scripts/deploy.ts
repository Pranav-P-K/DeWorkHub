import { ethers } from "hardhat";

async function main() {
    const [dao] = await ethers.getSigners(); // DAO is the deployer
    console.log("Deploying contracts with DAO (deployer):", dao.address);

    // Deploy ReputationNFT contract
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    const reputationNFT = await ReputationNFT.deploy();
    await reputationNFT.waitForDeployment();
    console.log("ReputationNFT deployed at:", await reputationNFT.getAddress());

    // Deploy JobEscrow contract with ReputationNFT and DAO addresses
    const JobEscrow = await ethers.getContractFactory("JobEscrow");
    const jobEscrow = await JobEscrow.deploy(await reputationNFT.getAddress(), dao.address);
    await jobEscrow.waitForDeployment();
    console.log("JobEscrow deployed at:", await jobEscrow.getAddress());

    // ✅ Done! No automatic job posting/hiring. Your Next.js app will handle transactions.
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
