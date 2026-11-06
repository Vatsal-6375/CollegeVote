/**
 * Smart Contract Interaction Layer
 * ethers.js v6
 */

import { Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig.js';
import { getProvider, getSigner } from './wallet.js';

function getReadContract() {
  const provider = getProvider();

  if (!provider) {
    throw new Error('Wallet not connected');
  }

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

function getWriteContract() {
  const signer = getSigner();

  if (!signer) {
    throw new Error('Wallet not connected');
  }

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// READ FUNCTIONS

export async function getAdmin() {
  return await getReadContract().admin();
}

export async function getElectionState() {
  const state = await getReadContract().getElectionState();
  return Number(state);
}

export async function getCandidateCount() {
  const count = await getReadContract().candidateCount();
  return Number(count);
}

export async function getAllCandidates() {
  const candidates = await getReadContract().getAllCandidates();

  return candidates.map(c => ({
    id: Number(c.id),
    name: c.name,
    voteCount: Number(c.voteCount)
  }));
}

export async function getTotalVotes() {
  const total = await getReadContract().totalVotes();
  return Number(total);
}

export async function isVoterRegistered(address) {
  return await getReadContract().isVoterRegistered(address);
}

export async function hasVoterVoted(address) {
  return await getReadContract().hasVoterVoted(address);
}

export async function getWinner() {
  const [name, votes, isTie] = await getReadContract().getWinner();

  return {
    name,
    voteCount: Number(votes),
    isTie: Boolean(isTie)
  };
}

// WRITE FUNCTIONS

export async function addCandidate(name) {
  const tx = await getWriteContract().addCandidate(name);
  return await tx.wait();
}

export async function registerVoter(voterAddress) {
  const tx = await getWriteContract().registerVoter(voterAddress);
  return await tx.wait();
}

export async function startElection() {
  const tx = await getWriteContract().startElection();
  return await tx.wait();
}

export async function endElection() {
  const tx = await getWriteContract().endElection();
  return await tx.wait();
}

export async function castVote(candidateId) {
  const tx = await getWriteContract().vote(candidateId);
  return await tx.wait();
}

// ERROR HANDLING

export function parseContractError(error) {
  if (!error) return 'An unknown error occurred.';

  if (error.reason) return error.reason;

  if (error.code === 'ACTION_REJECTED' ||
      error.message?.toLowerCase().includes('user rejected')) {
    return 'Transaction was rejected by user.';
  }

  if (error.message) {
    const match = error.message.match(/reason="([^"]+)"/);
    if (match) return match[1];
  }

  return error.message || 'Transaction failed. Please try again.';
}