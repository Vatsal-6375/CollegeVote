# 🗳️ CollegeVote — Blockchain-Based College Voting System

A transparent and decentralized platform for secure college elections, built with Solidity smart contracts on the Ethereum blockchain.

> **Built for**: B.Tech Computer Science College Project  
> **Blockchain**: Local Hardhat Ethereum Network  
> **Frontend**: Vanilla HTML/CSS/JavaScript with Vite

---

## 📋 Table of Contents

1. [Project Introduction](#-project-introduction)
2. [Problem Statement](#-problem-statement)
3. [Objectives](#-objectives)
4. [Technology Stack](#-technology-stack)
5. [Features](#-features)
6. [Folder Structure](#-folder-structure)
7. [Setup & Installation](#-setup--installation)
8. [How to Run the Project](#-how-to-run-the-project)
9. [MetaMask Setup Guide](#-metamask-setup-guide)
10. [How to Conduct a Demo Election](#-how-to-conduct-a-demo-election)
11. [How Voting Works](#-how-voting-works)
12. [Smart Contract Explanation](#-smart-contract-explanation)
13. [Glossary — Key Terms Explained](#-glossary--key-terms-explained)
14. [Security & Privacy Limitations](#-security--privacy-limitations)
15. [Troubleshooting](#-troubleshooting)
16. [Viva Questions & Answers](#-viva-questions--answers)
17. [Team Members](#-team-members)

---

## 🎓 Project Introduction

**CollegeVote** is a blockchain-based college voting system that allows students to participate in a student council election using their MetaMask cryptocurrency wallet. The system ensures that every vote is:

- **Transparent** — Anyone can verify results on the blockchain
- **Tamper-proof** — Votes cannot be changed once recorded
- **Secure** — Only registered wallets can vote, and only once
- **Decentralized** — No single authority can manipulate the results

The entire voting logic runs on a **Solidity smart contract** deployed on a local Hardhat Ethereum blockchain. There is no database — the blockchain itself stores all election data.

---

## 🧩 Problem Statement

Traditional college elections suffer from several issues:

- **Lack of transparency** — Students cannot verify how votes are counted
- **Vote tampering** — Paper ballots or centralized digital systems can be manipulated
- **Double voting** — Difficult to prevent a student from voting more than once
- **Trust issues** — Students may not trust the election committee

**Solution**: A blockchain-based system where voting rules are enforced by a smart contract that no one can modify after deployment. Every vote is a permanent, verifiable transaction on the blockchain.

---

## 🎯 Objectives

1. Build a fully functional online voting system using blockchain technology
2. Use Solidity smart contracts to enforce voting rules automatically
3. Ensure each voter can only vote once (enforced by the blockchain)
4. Provide transparent, real-time election results
5. Create a user-friendly interface that beginners can understand
6. Demonstrate practical blockchain application in a college setting

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Website structure |
| **CSS3** | Styling and responsive design |
| **Vanilla JavaScript** | Frontend logic and DOM manipulation |
| **Vite** | Frontend development server and build tool |
| **Solidity** | Smart contract programming language |
| **Hardhat** | Ethereum development environment and local blockchain |
| **ethers.js v6** | JavaScript library to interact with Ethereum |
| **MetaMask** | Browser wallet for blockchain transactions |

**No backend server, no database, no React/Angular/Vue** — the smart contract IS the backend.

---

## ✨ Features

### For Administrators
- ✅ Add election candidates
- ✅ Register eligible voter wallet addresses
- ✅ Start the election
- ✅ End the election
- ✅ View real-time election status

### For Voters
- ✅ Connect MetaMask wallet
- ✅ View list of candidates
- ✅ Cast a vote (one per wallet)
- ✅ View live/final election results
- ✅ See transaction confirmation on the blockchain

### System Features
- ✅ Duplicate vote prevention (enforced by smart contract)
- ✅ Only registered wallets can vote
- ✅ Winner determination with tie detection
- ✅ Real-time data from the deployed smart contract
- ✅ Mobile-responsive design
- ✅ Loading indicators for blockchain transactions
- ✅ Clear error messages for all failure cases
- ✅ 37 automated smart contract tests

---

## 📁 Folder Structure

```
blockchain/
├── contracts/
│   └── Voting.sol              ← Solidity smart contract (voting logic)
├── scripts/
│   └── deploy.js               ← Deployment script (auto-exports ABI)
├── test/
│   └── Voting.test.js          ← 37 automated tests
├── hardhat.config.js            ← Hardhat configuration
├── package.json                 ← Blockchain dev dependencies
│
├── frontend/
│   ├── index.html               ← Single-page application
│   ├── package.json             ← Vite dependency
│   ├── vite.config.js           ← Vite configuration
│   └── src/
│       ├── css/
│       │   └── styles.css       ← Complete design system (1700+ lines)
│       └── js/
│           ├── app.js           ← Main application controller
│           ├── wallet.js        ← MetaMask connection module
│           ├── contract.js      ← Smart contract interaction layer
│           ├── contractConfig.js← Auto-generated contract address + ABI
│           └── ui.js            ← UI rendering and DOM helpers
│
├── README.md                    ← This file
└── .gitignore
```

---

## ⚡ Setup & Installation

### Prerequisites

Make sure these are installed on your computer:

1. **Node.js** (v18 or later) — [Download](https://nodejs.org/)
2. **MetaMask** browser extension — [Install](https://metamask.io/download/)
3. **Git** — [Download](https://git-scm.com/)

### Step 1: Clone or navigate to the project

```bash
cd "blockchain voting system/blockchain"
```

### Step 2: Install blockchain dependencies

```bash
npm install
```

### Step 3: Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Compile the smart contract

```bash
npx hardhat compile
```

You should see: `Compiled 1 Solidity file successfully`

### Step 5: Run automated tests (optional but recommended)

```bash
npx hardhat test
```

You should see: `37 passing`

---

## 🚀 How to Run the Project

You need **three terminal windows** open simultaneously:

### Terminal 1: Start the Local Blockchain

```bash
npx hardhat node
```

This starts a local Ethereum blockchain at `http://127.0.0.1:8545` with 20 test accounts, each funded with 10,000 ETH.

**⚠️ Keep this terminal open! Closing it stops the blockchain and erases all data.**

### Terminal 2: Deploy the Smart Contract

```bash
npx hardhat run scripts/deploy.js --network localhost
```

You should see:
```
Deploying Voting contract...
Voting contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract configuration exported to frontend/src/js/contractConfig.js
```

The deploy script automatically updates the frontend with the contract address and ABI.

### Terminal 3: Start the Frontend

```bash
cd frontend
npx vite
```

Open your browser to: **http://localhost:5173**

---

## 🦊 MetaMask Setup Guide

### 1. Add the Hardhat Network to MetaMask

1. Open MetaMask → Click the network dropdown (top left)
2. Click **"Add Network"** → **"Add a network manually"**
3. Enter these details:

| Field | Value |
|---|---|
| Network Name | `Hardhat Local` |
| New RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | `ETH` |

4. Click **Save**

### 2. Import a Test Account

When you run `npx hardhat node`, it displays 20 test accounts. Import one into MetaMask:

1. Copy the **private key** of Account #0 (the admin account):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
2. In MetaMask → Click your avatar → **"Import Account"**
3. Select **"Private Key"** → Paste the key → Click **Import**

**⚠️ These are TEST accounts with fake ETH. Never use these keys on a real network!**

### 3. Import Additional Voter Accounts

Repeat the import process for Account #1 and Account #2 to use as voters:

- Account #1 key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Account #2 key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

---

## 🗳️ How to Conduct a Demo Election

Follow these steps during your college presentation:

### Phase 1: Admin Setup (use Account #0)

1. Open the website → Click **"Connect Wallet"** (connect with Account #0)
2. Go to **Admin Panel**
3. **Add Candidates**:
   - Type "Rahul Sharma" → Click "Add Candidate"
   - Type "Priya Patel" → Click "Add Candidate"
   - Type "Aman Verma" → Click "Add Candidate"
4. **Register Voters**:
   - Copy the address of Account #1 → Paste → Click "Register Voter"
   - Copy the address of Account #2 → Paste → Click "Register Voter"
5. Click **"Start Election"** → Confirm

### Phase 2: Voting (switch accounts in MetaMask)

1. In MetaMask, switch to **Account #1**
2. Go to **Cast Your Vote** → The wallet auto-connects
3. Select a candidate (e.g., "Rahul Sharma")
4. Click **"Confirm Vote"** → Approve the MetaMask transaction
5. See the success message with the transaction hash

6. Switch to **Account #2** in MetaMask
7. Go to **Cast Your Vote** → Select a different candidate
8. Confirm and approve the transaction

### Phase 3: Results

1. Go to **Results** page → See live vote counts with progress bars
2. Switch back to **Account #0** (admin)
3. Go to **Admin Panel** → Click **"End Election"** → Confirm
4. Go to **Results** → See the winner announcement!

### Demo Tips for Viva
- Show the Admin Panel first — explain roles
- Show a vote being cast — point out the MetaMask popup
- Show the Results updating in real-time
- Try voting twice with the same account — show the error
- Try voting with an unregistered account — show the error
- Explain that the smart contract prevents cheating, not the website

---

## ⚙️ How Voting Works

### Communication Flow

```
User → Website → MetaMask → Smart Contract → Local Blockchain → Website Results
```

1. The voter clicks "Vote" on the website
2. The website sends a transaction request to MetaMask
3. MetaMask asks the voter to approve and sign the transaction
4. The signed transaction is sent to the smart contract
5. The smart contract checks:
   - Is the voter registered? ✅
   - Has the voter already voted? ✅
   - Is the election ongoing? ✅
   - Is the candidate ID valid? ✅
6. If all checks pass, the vote is recorded on the blockchain
7. The website reads the updated data and displays results

### Why Can't Someone Vote Twice?

The smart contract maintains a mapping: `hasVoted[walletAddress] → true/false`

When a voter casts a vote:
1. The contract checks `hasVoted[msg.sender]`
2. If `true` → The transaction is **rejected** with "You have already voted"
3. If `false` → The vote is recorded, and `hasVoted[msg.sender]` is set to `true`

This check happens **inside the smart contract on the blockchain**, not on the website. Even if someone modifies the website code, they cannot bypass this check.

---

## 📜 Smart Contract Explanation

The `Voting.sol` contract contains:

### Data Structures

- **Candidate**: Has an `id`, `name`, and `voteCount`
- **ElectionState**: Can be `NotStarted`, `Ongoing`, or `Ended`

### Key Functions

| Function | Who Can Call | What It Does |
|---|---|---|
| `addCandidate(name)` | Admin only | Adds a student as a candidate |
| `registerVoter(address)` | Admin only | Registers a wallet as an eligible voter |
| `startElection()` | Admin only | Changes state to Ongoing |
| `endElection()` | Admin only | Changes state to Ended |
| `vote(candidateId)` | Registered voters | Casts a vote for a candidate |
| `getAllCandidates()` | Anyone | Returns all candidates and their vote counts |
| `getWinner()` | Anyone (after ended) | Returns the winner (with tie detection) |

### Security Rules (enforced by the contract)
- Only the admin (contract deployer) can manage the election
- Candidates can only be added before the election starts
- Voters can only be registered before the election starts
- Only registered wallets can vote
- Each wallet can vote exactly once
- Voting is only allowed while the election is ongoing
- The election cannot be restarted after it ends

---

## 📖 Glossary — Key Terms Explained

| Term | Simple Explanation |
|---|---|
| **Blockchain** | A digital ledger that records transactions permanently. No one can edit or delete past entries. |
| **Smart Contract** | A program that runs on the blockchain. It automatically enforces rules (like "one vote per person") without needing a trusted middleman. |
| **Solidity** | The programming language used to write smart contracts for Ethereum. |
| **MetaMask** | A browser extension that acts as a digital wallet. It stores your blockchain identity and signs transactions. |
| **Wallet Address** | A unique identifier (like `0xAbC123...`) for your MetaMask account. Used instead of a name on the blockchain. |
| **Transaction** | An action on the blockchain (like voting). Each transaction is permanently recorded and has a unique hash. |
| **Transaction Hash** | A unique ID for a specific transaction, like a receipt number. |
| **Gas** | A small fee paid to process a transaction on the blockchain. On our local test network, gas is free. |
| **Admin** | The person who deployed the smart contract. They manage the election. |
| **Candidate** | A student who is standing in the election. Added by the admin. |
| **Voter** | A registered student who can cast a vote using their wallet. |
| **Hardhat** | A development tool that creates a local Ethereum blockchain for testing. |
| **ethers.js** | A JavaScript library that lets the website communicate with the blockchain. |
| **ABI** | Application Binary Interface — tells the website how to talk to the smart contract. |
| **Deploy** | Publishing the smart contract onto the blockchain so it can be used. |

---

## 🔒 Security & Privacy Limitations

This is a **college demonstration project** and has these limitations:

1. **Not production-ready** — Runs on a local test blockchain, not a real one
2. **No encryption** — Votes are visible on the blockchain (not secret ballot)
3. **Admin is all-powerful** — The admin can add/remove voters. In a real system, this would need checks and balances
4. **No identity verification** — Anyone with the private key of a registered wallet can vote. There's no way to verify the actual person
5. **Single admin** — Only one person controls the election
6. **Local blockchain only** — Data is lost when the Hardhat node stops
7. **No voter privacy** — It's possible to see which wallet voted for which candidate by analyzing transaction data

For a real-world election system, you would need: encryption, multi-party administration, identity verification (KYC), a public blockchain, and auditing mechanisms.

---

## 🔧 Troubleshooting

### "MetaMask not connecting"
- Make sure MetaMask is installed and unlocked
- Make sure you're on the Hardhat Local network (Chain ID: 31337)
- Make sure the Hardhat node is running (`npx hardhat node`)

### "Wrong network" warning
- Open MetaMask → Switch to "Hardhat Local" network
- If the network isn't there, add it manually (see MetaMask Setup Guide above)

### "Contract not deployed" or "data loading errors"
- Make sure the Hardhat node is running
- Re-deploy the contract: `npx hardhat run scripts/deploy.js --network localhost`
- Refresh the website

### "Nonce too high" error in MetaMask
This happens when you restart the Hardhat node. MetaMask remembers the old nonce.
- Open MetaMask → Settings → Advanced → Click **"Clear activity and nonce data"**

### "Transaction reverted"
- The smart contract rejected the action. Common reasons:
  - Voting before the election starts
  - Voting with an unregistered wallet
  - Voting twice
  - Non-admin trying admin actions

### Starting fresh
If anything goes wrong:
1. Stop the Hardhat node (Ctrl+C in Terminal 1)
2. Start it again: `npx hardhat node`
3. Re-deploy: `npx hardhat run scripts/deploy.js --network localhost`
4. Clear MetaMask nonce data (see above)
5. Refresh the website

---

## 📝 Viva Questions & Answers

### Q1: What is blockchain?
**A**: Blockchain is a distributed, immutable digital ledger that records transactions across multiple computers. Each block contains a hash of the previous block, forming a chain. Once data is recorded, it cannot be altered without changing all subsequent blocks.

### Q2: What is a smart contract?
**A**: A smart contract is a self-executing program stored on the blockchain. It automatically enforces predefined rules. In our project, the smart contract enforces voting rules like "one vote per wallet" and "only registered voters can vote."

### Q3: Why use blockchain for voting?
**A**: Blockchain provides transparency (anyone can verify results), immutability (votes cannot be changed), and trustless operation (rules are enforced by code, not by a person). This eliminates vote tampering and builds trust in the election process.

### Q4: What is MetaMask?
**A**: MetaMask is a browser extension that serves as an Ethereum wallet. It stores the user's private key, manages their blockchain identity, and allows them to sign and send transactions to smart contracts.

### Q5: What is the difference between a candidate and a voter?
**A**: A **candidate** is a student standing in the election (e.g., running for class representative). A **voter** is a registered student who casts a vote to choose among the candidates. A candidate is added by the admin; a voter connects their own wallet to vote.

### Q6: Why do we use wallet addresses instead of student names?
**A**: The smart contract identifies users by their unique wallet address (e.g., `0xAbc...`). This provides cryptographic identity verification — only the person with the private key for that address can send transactions from it. Names are not unique and cannot be cryptographically verified.

### Q7: How does the smart contract prevent double voting?
**A**: The contract uses a mapping `hasVoted[address] => bool`. Before recording a vote, it checks if `hasVoted[msg.sender]` is `true`. If yes, the transaction is rejected. If no, the vote is recorded and the flag is set to `true`. This check happens on-chain and cannot be bypassed by the frontend.

### Q8: What is Solidity?
**A**: Solidity is a statically-typed, high-level programming language designed for writing smart contracts on the Ethereum Virtual Machine (EVM). Its syntax is similar to JavaScript.

### Q9: What is Hardhat?
**A**: Hardhat is a development environment for Ethereum. It provides a local blockchain for testing, tools for compiling and deploying contracts, and a testing framework. It simulates a real Ethereum network on your computer.

### Q10: What is ethers.js?
**A**: ethers.js is a JavaScript library for interacting with the Ethereum blockchain. It allows the frontend to read data from smart contracts, send transactions, and connect to MetaMask.

### Q11: What is the ABI?
**A**: ABI stands for Application Binary Interface. It's a JSON array that describes the smart contract's functions, their parameters, and return values. The frontend uses the ABI to know how to call the contract's functions.

### Q12: What happens when the Hardhat node restarts?
**A**: All blockchain data is lost because Hardhat runs an in-memory blockchain. You need to re-deploy the contract and start a new election. You should also clear MetaMask's nonce data.

### Q13: Can someone hack this voting system?
**A**: The smart contract logic is secure — no one can vote twice or vote without being registered. However, this is a local test project. A production system would need: a real public blockchain, identity verification, vote encryption, and multi-party administration.

### Q14: What is gas?
**A**: Gas is the fee paid to execute a transaction on Ethereum. Every operation in a smart contract costs gas. On our local Hardhat network, gas exists but uses free test ETH.

### Q15: How are results calculated?
**A**: The smart contract stores a `voteCount` for each candidate. When someone votes, `candidates[candidateId].voteCount` is incremented by 1. The `getWinner()` function iterates through all candidates to find the one with the maximum vote count and also checks for ties.

### Q16: What is a transaction hash?
**A**: A transaction hash is a unique identifier for a specific transaction on the blockchain. It's a 66-character hexadecimal string (e.g., `0xabc123...`). You can use it to look up the transaction details.

### Q17: What does "decentralized" mean in this context?
**A**: Decentralized means no single entity controls the system. The voting rules are enforced by the smart contract code running on the blockchain, not by a server controlled by one person. Once deployed, even the admin cannot change the voting rules.

### Q18: What is a modifier in Solidity?
**A**: A modifier is a reusable piece of code that adds conditions to a function. For example, `onlyAdmin` checks that `msg.sender == admin` before executing the function. If the condition fails, the transaction is reverted.

### Q19: What are events in Solidity?
**A**: Events are logs emitted by smart contracts during transactions. They are stored in the transaction receipt and can be listened to by the frontend. For example, `VoteCast(address voter, uint candidateId)` is emitted every time someone votes.

### Q20: Can the admin change votes?
**A**: No. Once a vote is recorded on the blockchain, it cannot be changed — not even by the admin. The admin can only add candidates, register voters, and start/end the election. The contract has no function to modify votes.

---

## 👥 Team Members

| Name | Role | Roll Number |
|---|---|---|
| [Student Name 1] | Smart Contract Development & Testing | [Roll Number] |
| [Student Name 2] | Frontend Development & UI Design | [Roll Number] |

**College**: [College Name]  
**Department**: Computer Science & Engineering  
**Year**: [Year]  
**Guide**: [Faculty Name]

---

## 📄 License

This project is for educational purposes as part of a B.Tech college project.

---

*Built with ❤️ using Ethereum, Solidity, and Web3 technologies*
