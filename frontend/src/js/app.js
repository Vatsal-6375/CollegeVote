// ============================================================
// app.js — Main Application Controller
// Blockchain-Based College Voting System
// ============================================================

import {
  isMetaMaskInstalled,
  connectWallet,
  getCurrentAccount,
  isCorrectNetwork,
  onAccountChanged,
  onChainChanged,
  formatAddress
} from './wallet.js';

import {
  getAdmin,
  getElectionState,
  getCandidateCount,
  getAllCandidates,
  getTotalVotes,
  isVoterRegistered,
  hasVoterVoted,
  getWinner,
  addCandidate,
  registerVoter,
  startElection,
  endElection,
  castVote,
  parseContractError
} from './contract.js';

import {
  showPage,
  updateDashboard,
  renderCandidates,
  renderVotingCandidates,
  updateVotingSteps,
  showVoteSuccess,
  showAlreadyVoted,
  renderResults,
  renderAdminStatus,
  renderAdminCandidates,
  updateNavWallet,
  updateVoterWalletInfo,
  showToast,
  showLoading,
  hideLoading,
  showConfirmModal,
  showNetworkWarning,
  getStateLabel
} from './ui.js';

// ============ APPLICATION STATE ============
let selectedCandidateId = null;
let currentCandidates = [];
let currentElectionState = 0;
let adminAddress = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initEventListeners();
  initMetaMaskListeners();

  // Navigate to the current hash or default to home
  const hash = window.location.hash.slice(1) || 'home';
  navigateTo(hash);
});

// ============ NAVIGATION ============
function initNavigation() {
  // Hash-based routing
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    navigateTo(hash);
  });

  // Nav link clicks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      window.location.hash = page;
    });
  });

  // Hero CTA buttons
  document.querySelectorAll('[data-navigate]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = btn.dataset.navigate;
    });
  });

  // Mobile hamburger
  const hamburger = document.getElementById('navToggle');
  const navLinks = document.getElementById('navMenu');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close mobile menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
}

function navigateTo(page) {
  const validPages = ['home', 'candidates', 'vote', 'results', 'admin'];
  if (!validPages.includes(page)) page = 'home';
  showPage(page);
  loadPageData(page);
}

// ============ EVENT LISTENERS ============
function initEventListeners() {
  // Nav connect wallet
  document.getElementById('navConnectBtn').addEventListener('click', handleConnectWallet);

  // Vote page connect
  document.getElementById('voteConnectBtn').addEventListener('click', handleConnectWallet);

  // Confirm vote
  document.getElementById('confirmVoteBtn').addEventListener('click', handleConfirmVote);

  // Admin: Add candidate
  document.getElementById('addCandidateBtn').addEventListener('click', handleAddCandidate);

  // Admin: Register voter
  document.getElementById('registerVoterBtn').addEventListener('click', handleRegisterVoter);

  // Admin: Start election
  document.getElementById('startElectionBtn').addEventListener('click', handleStartElection);

  // Admin: End election
  document.getElementById('endElectionBtn').addEventListener('click', handleEndElection);

  // Enter key support for inputs
  document.getElementById('candidateNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddCandidate();
  });
  document.getElementById('voterAddressInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRegisterVoter();
  });

  // Collapsible sections
  document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      trigger.classList.toggle('open');
      content.classList.toggle('open');
    });
  });
}

// ============ METAMASK LISTENERS ============
function initMetaMaskListeners() {
  onAccountChanged(async (account) => {
    updateNavWallet(account);
    if (account) {
      showToast('Account changed to ' + formatAddress(account), 'info');
    } else {
      showToast('Wallet disconnected', 'warning');
    }
    // Reload current page data
    const hash = window.location.hash.slice(1) || 'home';
    loadPageData(hash);
  });

  onChainChanged(() => {
    // Page reloads on chain change (handled in wallet.js)
  });
}

// ============ CONNECT WALLET ============
async function handleConnectWallet() {
  if (!isMetaMaskInstalled()) {
    showToast('MetaMask is not installed. Please install MetaMask browser extension.', 'error');
    return;
  }

  try {
    const account = await connectWallet();
    updateNavWallet(account);

    // Check network
    const correctNetwork = await isCorrectNetwork();
    showNetworkWarning(!correctNetwork);

    if (!correctNetwork) {
      showToast('Please switch to Hardhat Local Network (Chain ID: 31337)', 'warning');
      return;
    }

    showToast('Wallet connected: ' + formatAddress(account), 'success');

    // Reload current page data
    const hash = window.location.hash.slice(1) || 'home';
    loadPageData(hash);
  } catch (error) {
    console.error('Connect wallet error:', error);
    showToast(error.message || 'Failed to connect wallet', 'error');
  }
}

// ============ PAGE DATA LOADING ============
async function loadPageData(page) {
  const account = getCurrentAccount();

  try {
    switch (page) {
      case 'home':
        await loadDashboard(account);
        break;
      case 'candidates':
        await loadCandidates();
        break;
      case 'vote':
        await loadVotingPage(account);
        break;
      case 'results':
        await loadResults();
        break;
      case 'admin':
        await loadAdminPanel(account);
        break;
    }
  } catch (error) {
    console.error(`Error loading ${page}:`, error);
    // Don't show error toast if wallet not connected (expected state)
    if (account) {
      showToast('Error loading data. Make sure the contract is deployed and you are on the correct network.', 'error');
    }
  }
}

// ============ DASHBOARD ============
async function loadDashboard(account) {
  if (!account) {
    updateDashboard({
      electionState: 0,
      candidateCount: 0,
      totalVotes: 0,
      account: null
    });
    return;
  }

  try {
    const [electionState, candidateCount, totalVotes] = await Promise.all([
      getElectionState(),
      getCandidateCount(),
      getTotalVotes()
    ]);

    currentElectionState = electionState;

    updateDashboard({
      electionState,
      candidateCount,
      totalVotes,
      account
    });
  } catch (error) {
    console.error('Dashboard load error:', error);
    updateDashboard({
      electionState: 0,
      candidateCount: 0,
      totalVotes: 0,
      account
    });
  }
}

// ============ CANDIDATES PAGE ============
async function loadCandidates() {
  const account = getCurrentAccount();
  if (!account) {
    renderCandidates([]);
    return;
  }

  try {
    const candidates = await getAllCandidates();
    currentCandidates = candidates;
    renderCandidates(candidates);
  } catch (error) {
    console.error('Candidates load error:', error);
    renderCandidates([]);
  }
}

// ============ VOTING PAGE ============
async function loadVotingPage(account) {
  selectedCandidateId = null;

  // Reset vote success display
  document.getElementById('voteSuccess').style.display = 'none';
  document.getElementById('alreadyVotedMsg').style.display = 'none';

  if (!account) {
    updateVoterWalletInfo(null, false);
    updateVotingSteps(1);
    return;
  }

  try {
    const [registered, voted, candidates, electionState] = await Promise.all([
      isVoterRegistered(account),
      hasVoterVoted(account),
      getAllCandidates(),
      getElectionState()
    ]);

    currentCandidates = candidates;
    currentElectionState = electionState;

    updateVoterWalletInfo(account, registered);

    if (voted) {
      showAlreadyVoted();
      updateVotingSteps(1);
      return;
    }

    if (!registered) {
      updateVotingSteps(1);
      return;
    }

    if (electionState !== 1) {
      updateVotingSteps(1);
      if (electionState === 0) {
        showToast('Election has not started yet. Please wait for the administrator.', 'info');
      } else {
        showToast('Election has ended. Voting is no longer available.', 'info');
      }
      return;
    }

    // Voter is registered, hasn't voted, and election is ongoing
    updateVotingSteps(2);
    renderVotingCandidates(candidates, null, handleCandidateSelect);
  } catch (error) {
    console.error('Voting page load error:', error);
  }
}

function handleCandidateSelect(candidateId) {
  selectedCandidateId = candidateId;
  const candidate = currentCandidates.find(c => c.id === candidateId);
  renderVotingCandidates(currentCandidates, candidateId, handleCandidateSelect);
  updateVotingSteps(3, { selectedCandidate: candidate });
}

// ============ CONFIRM VOTE ============
async function handleConfirmVote() {
  if (!selectedCandidateId) {
    showToast('Please select a candidate first', 'warning');
    return;
  }

  const candidate = currentCandidates.find(c => c.id === selectedCandidateId);
  const confirmed = await showConfirmModal(
    'Confirm Your Vote',
    `Are you sure you want to vote for ${candidate.name} (ID #${candidate.id})? This action cannot be undone.`
  );

  if (!confirmed) return;

  showLoading();

  try {
    const receipt = await castVote(selectedCandidateId);
    hideLoading();
    showVoteSuccess(receipt.hash);
    showToast('Your vote has been recorded on the blockchain!', 'success');
  } catch (error) {
    hideLoading();
    const message = parseContractError(error);
    showToast(message, 'error');
    console.error('Vote error:', error);
  }
}

// ============ RESULTS PAGE ============
async function loadResults() {
  const account = getCurrentAccount();
  if (!account) {
    renderResults([], 0, 0);
    return;
  }

  try {
    const [candidates, totalVotes, electionState] = await Promise.all([
      getAllCandidates(),
      getTotalVotes(),
      getElectionState()
    ]);

    currentElectionState = electionState;
    renderResults(candidates, totalVotes, electionState);
  } catch (error) {
    console.error('Results load error:', error);
    renderResults([], 0, 0);
  }
}

// ============ ADMIN PANEL ============
async function loadAdminPanel(account) {
  if (!account) {
    renderAdminStatus({
      account: null,
      admin: null,
      electionState: 0
    });
    renderAdminCandidates([]);
    return;
  }

  try {
    const [admin, electionState, candidates] = await Promise.all([
      getAdmin(),
      getElectionState(),
      getAllCandidates()
    ]);

    adminAddress = admin;
    currentElectionState = electionState;
    currentCandidates = candidates;

    renderAdminStatus({
      account,
      admin,
      electionState
    });

    renderAdminCandidates(candidates);
  } catch (error) {
    console.error('Admin panel load error:', error);
    renderAdminStatus({
      account,
      admin: null,
      electionState: 0
    });
  }
}

// ============ ADMIN: ADD CANDIDATE ============
async function handleAddCandidate() {
  const input = document.getElementById('candidateNameInput');
  const name = input.value.trim();

  if (!name) {
    showToast('Please enter a candidate name', 'warning');
    input.focus();
    return;
  }

  showLoading();

  try {
    await addCandidate(name);
    hideLoading();
    input.value = '';
    showToast(`Candidate "${name}" added successfully!`, 'success');
    await loadAdminPanel(getCurrentAccount());
  } catch (error) {
    hideLoading();
    const message = parseContractError(error);
    showToast(message, 'error');
    console.error('Add candidate error:', error);
  }
}

// ============ ADMIN: REGISTER VOTER ============
async function handleRegisterVoter() {
  const input = document.getElementById('voterAddressInput');
  const address = input.value.trim();

  if (!address) {
    showToast('Please enter a wallet address', 'warning');
    input.focus();
    return;
  }

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    showToast('Invalid wallet address format. Must be a 42-character hex string starting with 0x.', 'error');
    input.focus();
    return;
  }

  showLoading();

  try {
    await registerVoter(address);
    hideLoading();
    input.value = '';
    showToast(`Voter ${formatAddress(address)} registered successfully!`, 'success');
  } catch (error) {
    hideLoading();
    const message = parseContractError(error);
    showToast(message, 'error');
    console.error('Register voter error:', error);
  }
}

// ============ ADMIN: START ELECTION ============
async function handleStartElection() {
  const confirmed = await showConfirmModal(
    'Start Election',
    'Are you sure you want to start the election? No more candidates or voters can be added after this.'
  );

  if (!confirmed) return;

  showLoading();

  try {
    await startElection();
    hideLoading();
    showToast('Election has started! Voters can now cast their votes.', 'success');
    await loadAdminPanel(getCurrentAccount());
  } catch (error) {
    hideLoading();
    const message = parseContractError(error);
    showToast(message, 'error');
    console.error('Start election error:', error);
  }
}

// ============ ADMIN: END ELECTION ============
async function handleEndElection() {
  const confirmed = await showConfirmModal(
    'End Election',
    'Are you sure you want to end the election? This action is permanent and voting will be closed.'
  );

  if (!confirmed) return;

  showLoading();

  try {
    await endElection();
    hideLoading();
    showToast('Election has ended. Final results are now available.', 'success');
    await loadAdminPanel(getCurrentAccount());
  } catch (error) {
    hideLoading();
    const message = parseContractError(error);
    showToast(message, 'error');
    console.error('End election error:', error);
  }
}
