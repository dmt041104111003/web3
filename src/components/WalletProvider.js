'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AptosClient } from 'aptos';

const WalletContext = createContext(null);

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const isMounted = useRef(false);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const pollIntervalRef = useRef(null);

  const getAptosWallet = () => {
    if ('aptos' in window) {
      return window.aptos;
    } else {
      window.open('https://petra.app/', '_blank');
      return null;
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const wallet = getAptosWallet();
      if (!wallet) {
        throw new Error('Vui lòng cài đặt Petra Wallet');
      }

      const response = await wallet.connect();
      console.log('Kết nối thành công:', response);
      
      const account = await wallet.account();
      console.log('Thông tin tài khoản:', account);

      setAccount(account);
      setIsConnected(true);

      return account;
    } catch (error) {
      console.error('Lỗi kết nối ví:', error);
      setError(error.message || 'Không thể kết nối với ví Petra');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const wallet = getAptosWallet();
      if (wallet) {
        await wallet.disconnect();
        setIsConnected(false);
        setAccount(null);
        setError(null);
      }
    } catch (error) {
      console.error('Lỗi khi ngắt kết nối ví:', error);
      setError(error.message);
    }
  };

  const signAndSubmitTransaction = async (transaction) => {
    try {
      setError(null);
      const wallet = getAptosWallet();
      if (!wallet) {
        throw new Error('Ví Petra không được tìm thấy');
      }
      
      if (!isConnected) {
        throw new Error('Ví chưa được kết nối');
      }
      
      const pendingTransaction = await wallet.signAndSubmitTransaction(transaction);
      
      let aptosClient;
      switch(network) {
        case 'Mainnet':
          aptosClient = new AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');
          break;
        case 'Testnet':
          aptosClient = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');
          break;
        case 'Devnet':
          aptosClient = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');
          break;
        default:
          aptosClient = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');
      }
      
      const txnResult = await aptosClient.waitForTransactionWithResult(pendingTransaction.hash);
      
      return {
        pendingTransaction,
        txnResult
      };
    } catch (error) {
      console.error('Lỗi khi ký và gửi giao dịch:', error);
      setError(error.message || 'Lỗi không xác định khi gửi giao dịch');
      throw error;
    }
  };

  const checkWalletStatus = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const wallet = getAptosWallet();
      if (!wallet) return;

      const isConnected = await wallet.isConnected();
      if (!isConnected) {
        if (isMounted.current) {
          setIsConnected(false);
          setAccount(null);
          setNetwork(null);
        }
        return;
      }

      const currentAccount = await wallet.account();
      if (currentAccount && isMounted.current) {
        setAccount(currentAccount);
        setIsConnected(true);
      }

      const currentNetwork = await wallet.network();
      if (currentNetwork && isMounted.current) {
        setNetwork(currentNetwork);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái ví:', error);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    isMounted.current = true;
    
    checkWalletStatus();
    
    pollIntervalRef.current = setInterval(checkWalletStatus, 2000);
    
    return () => {
      isMounted.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [checkWalletStatus]);

  useEffect(() => {
    if (!isMounted.current) return;
    
    const setupDisconnectListener = async () => {
      try {
        const wallet = getAptosWallet();
        if (!wallet) return;
        
        wallet.onDisconnect(() => {
          console.log('Ví đã ngắt kết nối');
          if (isMounted.current) {
            setIsConnected(false);
            setAccount(null);
            setNetwork(null);
          }
        });
      } catch (error) {
        console.error('Lỗi khi thiết lập sự kiện lắng nghe ngắt kết nối:', error);
      }
    };

    setupDisconnectListener();

    return () => {
      const wallet = getAptosWallet();
      if (wallet && wallet.removeAllListeners) {
        wallet.removeAllListeners();
      }
    };
  }, []);

  const walletContextValue = {
    account,
    isConnected,
    isConnecting,
    error,
    network,
    isClient,
    connectWallet,
    disconnectWallet,
    signAndSubmitTransaction,
    getAptosWallet,
  };

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
}
