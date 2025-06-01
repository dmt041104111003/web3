import { useState, useEffect, useCallback } from 'react';
import { AptosClient } from 'aptos';
import { useWallet } from '@/components/WalletProvider';

export default function useTransactions() {
  const { account, network } = useWallet();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(3);
  
  const nodeUrls = {
    Mainnet: [
      'https://fullnode.mainnet.aptoslabs.com/v1',
      'https://aptos-mainnet-api.nodereal.io/v1/fullnode',
      'https://aptos-mainnet.pontem.network'
    ],
    Testnet: [
      'https://fullnode.testnet.aptoslabs.com/v1',
      'https://aptos-testnet-api.nodereal.io/v1/fullnode',
      'https://aptos-testnet.pontem.network'
    ],
    Devnet: [
      'https://fullnode.devnet.aptoslabs.com/v1',
      'https://aptos-devnet-api.nodereal.io/v1/fullnode'
    ]
  };

  const fetchTransactionHistory = useCallback(async () => {
    if (!account?.address) return;
    setIsLoadingHistory(true);
    
    try {
      const urls = nodeUrls[network] || nodeUrls.Testnet;
      let success = false;
      let transactions = [];
      
      for (const nodeUrl of urls) {
        if (success) break;
        
        try {
          console.log(`Đang lấy lịch sử giao dịch từ node: ${nodeUrl}`);
          const aptosClient = new AptosClient(nodeUrl);
          
          const limit = 25; 
          
          const accountTransactions = await aptosClient.getAccountTransactions(account.address, { limit });
          
          transactions = accountTransactions
            .filter(tx => {
              return tx.type === 'user_transaction' && 
                    tx.payload && 
                    tx.payload.function === '0x1::coin::transfer' &&
                    tx.payload.type_arguments.includes('0x1::aptos_coin::AptosCoin');
            })
            .map(tx => {
              let amount = '0';
              let recipient = '';
              
              if (tx.payload && tx.payload.arguments) {
                recipient = tx.payload.arguments[0];
                amount = tx.payload.arguments[1];
              }
              
              return {
                hash: tx.hash,
                recipient: recipient,
                amount: amount,
                timestamp: tx.timestamp,
                status: tx.success ? 'thành công' : 'thất bại',
                network: network
              };
            });
          
          transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          setTransactionHistory(transactions);
          success = true;
          break;
          
        } catch (nodeError) {
          console.error(`Lỗi khi kết nối với node ${nodeUrl}:`, nodeError);
        }
      }
      
      if (!success) {
        throw new Error('Không thể kết nối với bất kỳ node nào');
      }
      
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử giao dịch từ blockchain:', error);
      setTransactionHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [account?.address, network]);

  const saveTransactionToHistory = useCallback((txData) => {
    try {
      const newTransaction = {
        hash: txData.hash,
        recipient: txData.recipient,
        amount: txData.amount,
        status: txData.status || 'thành công',
        timestamp: new Date().toISOString(),
        network: network
      };
      
      setTransactionHistory(prevHistory => [newTransaction, ...prevHistory]);
      
      setTimeout(() => fetchTransactionHistory(), 2000);
    } catch (error) {
      console.error('Lỗi khi lưu lịch sử giao dịch:', error);
    }
  }, [network, fetchTransactionHistory]);

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactionHistory.slice(indexOfFirstTransaction, indexOfLastTransaction);
  
  const totalPages = Math.ceil(transactionHistory.length / transactionsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (account?.address) {
      fetchTransactionHistory();
      
      const intervalId = setInterval(() => {
        console.log('Đang tự động cập nhật lịch sử giao dịch...');
        fetchTransactionHistory();
      }, 10000);
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('Tab được focus lại, đang cập nhật lịch sử giao dịch...');
          fetchTransactionHistory();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [account?.address, network, fetchTransactionHistory]);

  const refreshTransactions = useCallback(() => {
    console.log('Đang làm mới lịch sử giao dịch theo yêu cầu...');
    return fetchTransactionHistory();
  }, [fetchTransactionHistory]);

  return {
    transactionHistory,
    currentTransactions,
    isLoadingHistory,
    currentPage,
    totalPages,
    paginate,
    saveTransactionToHistory,
    fetchTransactionHistory,
    refreshTransactions
  };
}
