import React, { createContext, useContext, useReducer, useEffect } from "react";
import { ethers } from "ethers";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { NETWORKS, ICP_CONFIG } from "../config";
import toast from "react-hot-toast";

// Initial state
const initialState = {
  // Ethereum state
  ethAccount: null,
  ethProvider: null,
  ethSigner: null,
  ethChainId: null,
  ethConnected: false,
  ethConnecting: false,

  // ICP state
  icpPrincipal: null,
  icpAuthClient: null,
  icpConnected: false,
  icpConnecting: false,

  // App state
  isLoading: false,
  error: null,
};

// Action types
const ACTIONS = {
  SET_ETH_CONNECTING: "SET_ETH_CONNECTING",
  SET_ETH_CONNECTED: "SET_ETH_CONNECTED",
  SET_ETH_DISCONNECTED: "SET_ETH_DISCONNECTED",
  SET_ICP_CONNECTING: "SET_ICP_CONNECTING",
  SET_ICP_CONNECTED: "SET_ICP_CONNECTED",
  SET_ICP_DISCONNECTED: "SET_ICP_DISCONNECTED",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
};

// Reducer
const walletReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_ETH_CONNECTING:
      return { ...state, ethConnecting: true, error: null };

    case ACTIONS.SET_ETH_CONNECTED:
      return {
        ...state,
        ethAccount: action.payload.account,
        ethProvider: action.payload.provider,
        ethSigner: action.payload.signer,
        ethChainId: action.payload.chainId,
        ethConnected: true,
        ethConnecting: false,
        error: null,
      };

    case ACTIONS.SET_ETH_DISCONNECTED:
      return {
        ...state,
        ethAccount: null,
        ethProvider: null,
        ethSigner: null,
        ethChainId: null,
        ethConnected: false,
        ethConnecting: false,
      };

    case ACTIONS.SET_ICP_CONNECTING:
      return { ...state, icpConnecting: true, error: null };

    case ACTIONS.SET_ICP_CONNECTED:
      return {
        ...state,
        icpPrincipal: action.payload.principal,
        icpAuthClient: action.payload.authClient,
        icpConnected: true,
        icpConnecting: false,
        error: null,
      };

    case ACTIONS.SET_ICP_DISCONNECTED:
      return {
        ...state,
        icpPrincipal: null,
        icpAuthClient: null,
        icpConnected: false,
        icpConnecting: false,
      };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};

// Create context
const WalletContext = createContext();

// Provider component
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return (
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.isMetaMask
    );
  };

  // Connect to Ethereum wallet
  const connectEthereum = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("Please install MetaMask to connect your Ethereum wallet");
      return;
    }

    dispatch({ type: ACTIONS.SET_ETH_CONNECTING });

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // Check if on correct network
      if (Number(network.chainId) !== NETWORKS.HOLESKY.chainId) {
        try {
          // Try to switch to Holesky
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${NETWORKS.HOLESKY.chainId.toString(16)}` }],
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${NETWORKS.HOLESKY.chainId.toString(16)}`,
                  chainName: NETWORKS.HOLESKY.name,
                  rpcUrls: [NETWORKS.HOLESKY.rpcUrl],
                  blockExplorerUrls: [NETWORKS.HOLESKY.blockExplorer],
                  nativeCurrency: NETWORKS.HOLESKY.nativeCurrency,
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      dispatch({
        type: ACTIONS.SET_ETH_CONNECTED,
        payload: {
          account: accounts[0],
          provider,
          signer,
          chainId: Number(network.chainId),
        },
      });

      toast.success("Ethereum wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting to Ethereum:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error("Failed to connect Ethereum wallet");
    }
  };

  // Disconnect Ethereum wallet
  const disconnectEthereum = () => {
    dispatch({ type: ACTIONS.SET_ETH_DISCONNECTED });
    toast.success("Ethereum wallet disconnected");
  };

  // Connect to ICP wallet
  const connectICP = async () => {
    dispatch({ type: ACTIONS.SET_ICP_CONNECTING });

    try {
      const authClient = await AuthClient.create();

      // Check if already authenticated
      const isAuthenticated = await authClient.isAuthenticated();

      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();

        dispatch({
          type: ACTIONS.SET_ICP_CONNECTED,
          payload: {
            principal: principal.toString(),
            authClient,
          },
        });

        toast.success("ICP wallet connected successfully!");
        return;
      }

      // Login with Internet Identity
      await authClient.login({
        identityProvider: ICP_CONFIG.IDENTITY_PROVIDER,
        maxTimeToLive: BigInt(8) * BigInt(3_600_000_000_000), // 8 hours in nanoseconds
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();

          dispatch({
            type: ACTIONS.SET_ICP_CONNECTED,
            payload: {
              principal: principal.toString(),
              authClient,
            },
          });

          toast.success("ICP wallet connected successfully!");
        },
        onError: (error) => {
          console.error("ICP login error:", error);
          dispatch({
            type: ACTIONS.SET_ERROR,
            payload: "Failed to connect to ICP",
          });
          toast.error("Failed to connect ICP wallet");
        },
      });
    } catch (error) {
      console.error("Error connecting to ICP:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error("Failed to connect ICP wallet");
    }
  };

  // Disconnect ICP wallet
  const disconnectICP = async () => {
    if (state.icpAuthClient) {
      await state.icpAuthClient.logout();
    }
    dispatch({ type: ACTIONS.SET_ICP_DISCONNECTED });
    toast.success("ICP wallet disconnected");
  };

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectEthereum();
        } else if (accounts[0] !== state.ethAccount) {
          connectEthereum();
        }
      };

      const handleChainChanged = (chainId) => {
        if (Number(chainId) !== NETWORKS.HOLESKY.chainId) {
          toast.error("Please switch to Holesky testnet");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [state.ethAccount]);

  // Auto-connect on load
  useEffect(() => {
    const autoConnect = async () => {
      // Auto-connect Ethereum if previously connected
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            connectEthereum();
          }
        } catch (error) {
          console.error("Auto-connect Ethereum failed:", error);
        }
      }

      // Auto-connect ICP if previously authenticated
      try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();
        if (isAuthenticated) {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();

          dispatch({
            type: ACTIONS.SET_ICP_CONNECTED,
            payload: {
              principal: principal.toString(),
              authClient,
            },
          });
        }
      } catch (error) {
        console.error("Auto-connect ICP failed:", error);
      }
    };

    autoConnect();
  }, []);

  const value = {
    ...state,
    connectEthereum,
    disconnectEthereum,
    connectICP,
    disconnectICP,
    isMetaMaskInstalled,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
