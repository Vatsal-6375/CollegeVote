const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n========== COLLEGE VOTE DEPLOYMENT ==========\n");

  // Get the account deploying the contract
  const [deployer] = await hre.ethers.getSigners();

  const adminAddress = await deployer.getAddress();

  console.log("Deploying from Admin Address:", adminAddress);

  // Deploy Voting Contract
  console.log("\nDeploying Voting contract...");

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();

  console.log("\nVoting Contract Deployed Successfully!");
  console.log("Contract Address:", contractAddress);

  // Verify Admin stored in Smart Contract
  const contractAdmin = await voting.admin();

  console.log("\n========== ADMIN VERIFICATION ==========");
  console.log("Deployer Address:", adminAddress);
  console.log("Contract Admin:", contractAdmin);

  if (adminAddress.toLowerCase() === contractAdmin.toLowerCase()) {
    console.log("SUCCESS: Admin address matched!");
  } else {
    throw new Error("Admin address mismatch!");
  }

  // Export Contract ABI and Address
  const votingArtifact = await hre.artifacts.readArtifact("Voting");

  const configContent = `export const CONTRACT_ADDRESS = '${contractAddress}';
export const CONTRACT_ABI = ${JSON.stringify(
    votingArtifact.abi,
    null,
    2
  )};
`;

  const targetDir = path.join(__dirname, "../frontend/src/js");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, "contractConfig.js");

  fs.writeFileSync(targetFile, configContent, "utf-8");

  console.log("\nContract configuration updated successfully!");
  console.log("File: frontend/src/js/contractConfig.js");

  console.log("\n========== DEPLOYMENT COMPLETE ==========\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nDEPLOYMENT FAILED:", error);
    process.exit(1);
  });