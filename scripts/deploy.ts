import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy ReputationNFT
    const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
    const reputationNFT = await ReputationNFT.deploy();
    await reputationNFT.waitForDeployment();
    console.log("ReputationNFT deployed at:", await reputationNFT.getAddress());

    // Deploy JobEscrow with ReputationNFT address & DAO address (for now, DAO is deployer)
    const JobEscrow = await ethers.getContractFactory("JobEscrow");
    const jobEscrow = await JobEscrow.deploy(await reputationNFT.getAddress(), deployer.address);
    await jobEscrow.waitForDeployment();
    console.log("JobEscrow deployed at:", await jobEscrow.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
