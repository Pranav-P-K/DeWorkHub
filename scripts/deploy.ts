import { ethers } from "hardhat";

async function main() {
    const [deployer, employer] = await ethers.getSigners(); // Assign separate employer
    console.log("Deploying contracts with DAO account (deployer):", deployer.address);
    console.log("Employer account:", employer.address);

    // Deploy ReputationNFT
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    const reputationNFT = await ReputationNFT.deploy();
    await reputationNFT.waitForDeployment();
    console.log("ReputationNFT deployed at:", await reputationNFT.getAddress());

    // Deploy JobEscrow with ReputationNFT address & DAO (deployer is DAO)
    const JobEscrow = await ethers.getContractFactory("JobEscrow");
    const jobEscrow = await JobEscrow.deploy(await reputationNFT.getAddress(), deployer.address);
    await jobEscrow.waitForDeployment();
    console.log("JobEscrow deployed at:", await jobEscrow.getAddress());

    // Employer posts a job
    console.log("Employer posting a job...");
    await jobEscrow.connect(employer).postJob();
    console.log("Job posted successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
