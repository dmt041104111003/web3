'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext(null);

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

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
        console.log('Ngắt kết nối thành công');
      }
      setAccount(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Lỗi ngắt kết nối ví:', error);
      setError(error.message || 'Không thể ngắt kết nối ví Petra');
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wallet = getAptosWallet();
        if (wallet) {
          const account = await wallet.account();
          if (account) {
            setAccount(account);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra kết nối:', error);
      }
    };

    checkConnection();
  }, []);

  const walletContextValue = {
    account,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getAptosWallet,
  };

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
}
