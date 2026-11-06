/**
 * Wallet Connection & MetaMask Integration
 * ethers.js v6
 */

import { BrowserProvider } from 'ethers';

let provider = null;
let signer = null;
let currentAccount = null;

const HARDHAT_CHAIN_ID = '0x7a69';

const HARDHAT_NETWORK = {
  chainId: HARDHAT_CHAIN_ID,
  chainName: 'Hardhat Local',
  rpcUrls: ['http://127.0.0.1:8545'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  }
};

// Check MetaMask
export function isMetaMaskInstalled() {
  return typeof window.ethereum !== 'undefined'
    && Boolean(window.ethereum.isMetaMask);
}

// Connect wallet
export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No MetaMask account selected.');
  }

  provider = new BrowserProvider(window.ethereum);

  currentAccount = accounts[0];

  // Explicitly use the selected account
  signer = await provider.getSigner(currentAccount);

  return currentAccount;
}

// Get current account
export function getCurrentAccount() {
  return currentAccount;
}

// Get provider
export function getProvider() {
  return provider;
}

// Get signer
export function getSigner() {
  return signer;
}

// Check network
export async function isCorrectNetwork() {
  if (!window.ethereum) return false;

  const chainId = await window.ethereum.request({
    method: 'eth_chainId'
  });

  return chainId.toLowerCase() === HARDHAT_CHAIN_ID;
}

// Switch to Hardhat network
export async function switchToHardhatNetwork() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not available.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_CHAIN_ID }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [HARDHAT_NETWORK]
      });
    } else {
      throw error;
    }
  }

  provider = new BrowserProvider(window.ethereum);
}

// Handle account switching
export function onAccountChanged(callback) {
  if (!window.ethereum) return;

  window.ethereum.removeListener('accountsChanged', handleAccountsChanged);

  window.ethereum.on('accountsChanged', handleAccountsChanged);

  async function handleAccountsChanged(accounts) {
    try {
      currentAccount = accounts[0] || null;

      if (currentAccount) {
        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner(currentAccount);
      } else {
        signer = null;
      }

      if (typeof callback === 'function') {
        callback(currentAccount);
      }
    } catch (error) {
      console.error('Account switching error:', error);
      signer = null;
      currentAccount = null;
    }
  }
}

// Handle network switching
export function onChainChanged() {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }
}

// Format address
export function formatAddress(address) {
  if (!address) return '';

  return address.slice(0, 6) + '...' + address.slice(-4);
}