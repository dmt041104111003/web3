import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { MODULE_PATH } from '@/config/contract';
import { Types, AptosClient } from 'aptos';

const APTOS_NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
const TRANSACTIONS_PER_PAGE = 5;

export function useTransactionHistory() {
  const { account } = useWallet();
  const [allTransactions, setAllTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!account?.address) return;

    setLoading(true);
    setError(null);

    try {
      const client = new AptosClient(APTOS_NODE_URL);
      
      const accountTransactions = await client.getAccountTransactions(
        account.address,
        { start: 0, limit: 50 }
      );
      
      const messageBoardTxns = accountTransactions.filter(txn => {
        return txn.payload && 
               txn.payload.function && 
               txn.payload.function.includes(MODULE_PATH);
      });
      
      const formattedTxns = messageBoardTxns.map(txn => {
        const functionPath = txn.payload.function || '';
        const functionName = functionPath.split('::').pop() || 'Unknown Function';
        
        const timestamp = new Date(txn.timestamp / 1000).toLocaleString();
        
        return {
          hash: txn.hash,
          sender: txn.sender,
          functionName,
          timestamp,
          status: txn.success ? 'Success' : 'Failed',
          version: txn.version,
          vmStatus: txn.vm_status,
          gasUsed: txn.gas_used,
          type: txn.type,
        };
      });
      
      setAllTransactions(formattedTxns);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [account?.address]);

  useEffect(() => {
    if (account?.address) {
      fetchTransactions();
    }
  }, [account?.address, fetchTransactions]);

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (hash) => {
    return `https://explorer.aptoslabs.com/txn/${hash}?network=devnet`;
  };

  const totalPages = Math.ceil(allTransactions.length / TRANSACTIONS_PER_PAGE);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const indexOfLastTransaction = currentPage * TRANSACTIONS_PER_PAGE;
  const indexOfFirstTransaction = indexOfLastTransaction - TRANSACTIONS_PER_PAGE;
  const currentTransactions = allTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  return {
    transactions: currentTransactions,
    allTransactionsCount: allTransactions.length,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    loading,
    error,
    formatAddress,
    getExplorerUrl,
    refreshTransactions: fetchTransactions
  };
}
