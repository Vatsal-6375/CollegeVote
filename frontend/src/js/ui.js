/**
 * UI Rendering and DOM Helper Module
 * Controls page routing, UI component updates, feedback toasts, and modals
 */
import { formatAddress } from './wallet.js';

// ============ PAGE NAVIGATION ============
export function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.style.display = 'block';
  }

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Close mobile navigation menu if open
  const navMenu = document.getElementById('navMenu');
  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
  }

  window.scrollTo(0, 0);
}

// ============ ELECTION STATE HELPERS ============
const STATE_LABELS = ['Not Started', 'Ongoing', 'Ended'];
const STATE_BADGES = ['badge-idle', 'badge-active', 'badge-ended'];

export function getStateLabel(state) {
  return STATE_LABELS[state] || 'Unknown';
}

export function getStateBadge(state) {
  return STATE_BADGES[state] || 'badge-idle';
}

// ============ DASHBOARD ============
export function updateDashboard(data) {
  const statusEl = document.getElementById('statElectionStatus');
  if (statusEl) {
    statusEl.textContent = getStateLabel(data.electionState);
    statusEl.className = `stat-value ${getStateBadge(data.electionState)}`;
  }

  const candidateCountEl = document.getElementById('statCandidateCount');
  if (candidateCountEl) {
    candidateCountEl.textContent = data.candidateCount ?? 0;
  }

  const totalVotesEl = document.getElementById('statTotalVotes');
  if (totalVotesEl) {
    totalVotesEl.textContent = data.totalVotes ?? 0;
  }

  const walletEl = document.getElementById('statWallet');
  if (walletEl) {
    walletEl.textContent = data.account ? formatAddress(data.account) : 'Not Connected';
  }
}

// ============ CANDIDATES PAGE ============
export function renderCandidates(candidates) {
  const container = document.getElementById('candidatesList');
  const emptyState = document.getElementById('noCandidates');
  if (!container || !emptyState) return;

  if (!candidates || candidates.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = candidates.map(c => `
    <div class="candidate-card">
      <span class="candidate-id">ID #${c.id}</span>
      <h3 class="candidate-name">${escapeHtml(c.name)}</h3>
      <span class="candidate-votes">${c.voteCount} vote${c.voteCount !== 1 ? 's' : ''}</span>
    </div>
  `).join('');
}

// ============ VOTING PAGE ============
export function renderVotingCandidates(candidates, selectedId, onSelect) {
  const container = document.getElementById('votingCandidates');
  if (!container) return;

  if (!candidates || candidates.length === 0) {
    container.innerHTML = '<p class="text-secondary">No candidates are registered for this election yet.</p>';
    return;
  }

  container.innerHTML = candidates.map(c => `
    <div class="voting-candidate-card ${c.id === selectedId ? 'selected' : ''}" data-id="${c.id}">
      <div class="radio-indicator">${c.id === selectedId ? '●' : '○'}</div>
      <div class="voting-candidate-info">
        <span class="candidate-id">ID #${c.id}</span>
        <h3 class="candidate-name">${escapeHtml(c.name)}</h3>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.voting-candidate-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id, 10);
      onSelect(id);
    });
  });
}

export function updateVotingSteps(step, data = {}) {
  const step2 = document.getElementById('voteStep2');
  const step3 = document.getElementById('voteStep3');

  if (step2) step2.classList.toggle('disabled', step < 2);
  if (step3) step3.classList.toggle('disabled', step < 3);

  const selectedCandidateEl = document.getElementById('selectedCandidateInfo');
  if (selectedCandidateEl) {
    if (data.selectedCandidate) {
      selectedCandidateEl.innerHTML = `
        <p>You are voting for: <strong>${escapeHtml(data.selectedCandidate.name)}</strong> (ID #${data.selectedCandidate.id})</p>
        <p class="text-secondary">This action cannot be undone. Please confirm your choice.</p>
      `;
    } else {
      selectedCandidateEl.innerHTML = `<p class="text-secondary">Please select a candidate in Step 2 above.</p>`;
    }
  }
}

export function showVoteSuccess(txHash) {
  const successEl = document.getElementById('voteSuccess');
  if (successEl) successEl.style.display = 'block';

  const txHashEl = document.getElementById('voteTxHash');
  if (txHashEl) txHashEl.textContent = txHash;

  const step3 = document.getElementById('voteStep3');
  if (step3) step3.classList.add('disabled');
}

export function showAlreadyVoted() {
  const votedEl = document.getElementById('alreadyVotedMsg');
  if (votedEl) votedEl.style.display = 'block';

  const step2 = document.getElementById('voteStep2');
  if (step2) step2.classList.add('disabled');

  const step3 = document.getElementById('voteStep3');
  if (step3) step3.classList.add('disabled');
}

// ============ RESULTS PAGE ============
export function renderResults(candidates, totalVotes, electionState) {
  const container = document.getElementById('resultsContainer');
  const noResults = document.getElementById('noResults');
  const statusBadge = document.getElementById('resultsStatus');
  const totalDisplay = document.getElementById('resultsTotalVotes');
  const winnerDiv = document.getElementById('winnerAnnouncement');

  if (!container || !noResults || !statusBadge || !totalDisplay || !winnerDiv) return;

  // Status
  if (electionState === 1) {
    statusBadge.textContent = '🟢 Live Results';
    statusBadge.className = 'results-badge badge-active';
  } else if (electionState === 2) {
    statusBadge.textContent = '🏁 Final Results';
    statusBadge.className = 'results-badge badge-ended';
  } else {
    statusBadge.textContent = '⏳ Election Not Started';
    statusBadge.className = 'results-badge badge-idle';
  }

  totalDisplay.textContent = `Total Votes Cast: ${totalVotes}`;

  if (!candidates || candidates.length === 0 || totalVotes === 0) {
    container.innerHTML = '';
    noResults.style.display = 'block';
    winnerDiv.style.display = 'none';
    return;
  }
  noResults.style.display = 'none';

  // Sort by votes descending
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);

  container.innerHTML = sorted.map(c => {
    const percentage = totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : 0;
    return `
      <div class="result-item">
        <div class="result-header">
          <span class="result-name">${escapeHtml(c.name)}</span>
          <span class="result-votes">${c.voteCount} vote${c.voteCount !== 1 ? 's' : ''} (${percentage}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Winner announcement (only after election ends)
  if (electionState === 2) {
    const maxVotes = sorted[0].voteCount;
    const winners = sorted.filter(c => c.voteCount === maxVotes);
    if (winners.length > 1) {
      winnerDiv.innerHTML = `<div class="winner-card tie">🤝 It's a Tie! ${winners.map(w => escapeHtml(w.name)).join(' & ')} — ${maxVotes} votes each</div>`;
    } else {
      winnerDiv.innerHTML = `<div class="winner-card">🏆 Winner: <strong>${escapeHtml(winners[0].name)}</strong> with ${maxVotes} votes!</div>`;
    }
    winnerDiv.style.display = 'block';
  } else {
    winnerDiv.style.display = 'none';
  }
}

// ============ ADMIN PAGE ============
export function renderAdminStatus(data) {
  const adminWalletEl = document.getElementById('adminWallet');
  if (adminWalletEl) {
    adminWalletEl.textContent = data.account ? formatAddress(data.account) : 'Not Connected';
  }

  const isAdmin = Boolean(data.account && data.admin && data.account.toLowerCase() === data.admin.toLowerCase());
  const adminStatusEl = document.getElementById('adminStatus');
  if (adminStatusEl) {
    adminStatusEl.textContent = isAdmin ? '✅ Administrator' : '❌ Not Administrator';
    adminStatusEl.className = isAdmin ? 'admin-badge authorized' : 'admin-badge unauthorized';
  }

  const adminElectionStateEl = document.getElementById('adminElectionState');
  if (adminElectionStateEl) {
    adminElectionStateEl.textContent = getStateLabel(data.electionState);
  }

  const deniedEl = document.getElementById('adminDenied');
  if (deniedEl) deniedEl.style.display = isAdmin ? 'none' : 'block';

  const controlsEl = document.getElementById('adminControls');
  if (controlsEl) controlsEl.style.display = isAdmin ? 'grid' : 'none';

  // Election control buttons state
  const startBtn = document.getElementById('startElectionBtn');
  const endBtn = document.getElementById('endElectionBtn');
  if (startBtn) startBtn.disabled = data.electionState !== 0;
  if (endBtn) endBtn.disabled = data.electionState !== 1;

  const controlStatusEl = document.getElementById('electionControlStatus');
  if (controlStatusEl) {
    controlStatusEl.textContent = `Current Status: ${getStateLabel(data.electionState)}`;
  }

  // Disable candidate/voter forms if election has started
  const canModify = data.electionState === 0;
  const candInput = document.getElementById('candidateNameInput');
  const addCandBtn = document.getElementById('addCandidateBtn');
  const voterInput = document.getElementById('voterAddressInput');
  const regVoterBtn = document.getElementById('registerVoterBtn');

  if (candInput) candInput.disabled = !canModify;
  if (addCandBtn) addCandBtn.disabled = !canModify;
  if (voterInput) voterInput.disabled = !canModify;
  if (regVoterBtn) regVoterBtn.disabled = !canModify;
}

export function renderAdminCandidates(candidates) {
  const container = document.getElementById('adminCandidatesList');
  if (!container) return;

  if (!candidates || candidates.length === 0) {
    container.innerHTML = '<p class="text-secondary">No candidates added yet.</p>';
    return;
  }

  container.innerHTML = '<h4>Current Candidates</h4>' + candidates.map(c => `
    <div class="admin-candidate-item">
      <span class="candidate-id">ID #${c.id}</span>
      <span class="candidate-name">${escapeHtml(c.name)}</span>
    </div>
  `).join('');
}

// ============ WALLET STATUS IN NAV ============
export function updateNavWallet(account) {
  const btn = document.getElementById('navConnectBtn');
  if (!btn) return;

  if (account) {
    btn.textContent = formatAddress(account);
    btn.classList.add('connected');
  } else {
    btn.textContent = 'Connect Wallet';
    btn.classList.remove('connected');
  }
}

export function updateVoterWalletInfo(account, isRegistered) {
  const walletInfo = document.getElementById('walletInfo');
  const warning = document.getElementById('unregisteredWarning');
  const voterAddress = document.getElementById('voterAddress');
  const voterStatus = document.getElementById('voterStatus');

  if (account) {
    if (walletInfo) walletInfo.style.display = 'block';
    if (voterAddress) voterAddress.textContent = account;
    if (voterStatus) {
      voterStatus.textContent = isRegistered ? '✅ Registered Voter' : '❌ Not Registered';
      voterStatus.className = isRegistered ? 'voter-status registered' : 'voter-status unregistered';
    }
    if (warning) warning.style.display = isRegistered ? 'none' : 'block';
  } else {
    if (walletInfo) walletInfo.style.display = 'none';
    if (warning) warning.style.display = 'none';
  }
}

// ============ TOAST NOTIFICATIONS ============
export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============ LOADING OVERLAY ============
export function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'flex';
}

export function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ============ CONFIRMATION MODAL ============
export function showConfirmModal(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
      resolve(true);
      return;
    }

    const titleEl = modal.querySelector('.modal-title');
    const msgEl = modal.querySelector('.modal-message');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    modal.style.display = 'flex';

    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');

    const cleanup = () => {
      modal.style.display = 'none';
      if (confirmBtn) confirmBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;
    };

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        cleanup();
        resolve(true);
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        cleanup();
        resolve(false);
      };
    }
  });
}

// ============ NETWORK WARNING ============
export function showNetworkWarning(show) {
  const warning = document.getElementById('networkWarning');
  if (warning) {
    warning.style.display = show ? 'block' : 'none';
  }
}

// ============ UTILITY ============
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
