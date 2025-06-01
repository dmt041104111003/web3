import { useState, useEffect } from 'react';
import { useWallet } from '../components/WalletProvider';
import { AptosClient } from 'aptos';
import { getMessage, messageExists, postMessage } from '../utils/contract';
import { CONTRACT_ADDRESS, MODULE_PATH, MODULE_NAME, PUBLISHER_ADDRESS } from '../config/contract';

// Tạo Aptos client dựa trên mạng devnet
const client = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');

/**
 * Hook để tương tác với Message Board smart contract
 */
export function useMessageBoard() {
  const { account, signAndSubmitTransaction, isConnected } = useWallet();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txnInProgress, setTxnInProgress] = useState(false);
  const [txnHash, setTxnHash] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const exists = await messageExists(client);
        
        if (exists) {
          const currentMessage = await getMessage(client);
          setMessage(currentMessage);
        } else {
          setMessage('');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching message:', err);
        setError('Không thể lấy tin nhắn từ smart contract');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
    
    const intervalId = setInterval(fetchMessage, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  
  const submitMessage = async (newMessage) => {
    if (!isConnected || !account) {
      setError('Vui lòng kết nối ví Aptos trước');
      return;
    }

    try {
      setTxnInProgress(true);
      
      if (!newMessage || newMessage.trim() === '') {
        setError('Tin nhắn không được để trống');
        setTxnInProgress(false);
        return;
      }
      
      console.log('Preparing transaction for message:', newMessage);
      
      const functionName = `${PUBLISHER_ADDRESS}::message_board::post_message`;
      console.log('Function name:', functionName);
      
      const payload = {
        type: "entry_function_payload",
        function: functionName,
        type_arguments: [],
        arguments: [newMessage]
      };
      
      console.log('Transaction payload:', JSON.stringify(payload, null, 2));
      
      try {

        let response;
        try {
          response = await window.aptos.signAndSubmitTransaction(payload);
          console.log('Direct Petra API response:', response);
        } catch (directApiError) {
          console.error('Error using direct Petra API:', directApiError);
          response = await signAndSubmitTransaction({
            payload
          });
          console.log('Wallet adapter response:', response);
        }
        
        console.log('Transaction submitted successfully');
        console.log('Transaction response:', response);
        
        let txHash;
        if (response && response.hash) {
          txHash = response.hash;
        } else if (response && typeof response === 'string') {
          txHash = response;
        } else if (response && response.result) {
          txHash = response.result;
        } else if (response && response.transaction_hash) {
          txHash = response.transaction_hash;
        }
        
        console.log('Extracted transaction hash:', txHash);
        
        setTxnHash(txHash);
        
        setMessage(newMessage);
        setError('Giao dịch đã được gửi và đang chờ xác nhận...');
        
        if (txHash) {
          try {
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            await client.waitForTransaction(txHash, { timeoutSecs: 30 });
            console.log('Transaction confirmed on blockchain');
            
            setError(null);
          } catch (confirmError) {
            console.error('Error confirming transaction:', confirmError);
            
            setError('Giao dịch đã được gửi nhưng chưa được xác nhận. Tin nhắn có thể đã được cập nhật trên blockchain.');
          }
        } else {
          console.log('No transaction hash available to confirm transaction');
          setError('Giao dịch đã được gửi nhưng không có mã giao dịch để theo dõi. Tin nhắn có thể đã được cập nhật trên blockchain.');
        }
      } catch (submitError) {
        console.error('Error submitting transaction:', submitError);
        setError(`Không thể gửi giao dịch: ${submitError.message || 'Lỗi không xác định'}`);
      }
    } catch (err) {
      console.error('Error submitting message:', err);
      setError('Không thể đăng tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setTxnInProgress(false);
    }
  };

  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const getExplorerUrl = () => {
    if (!txnHash) return null;
    return `https://explorer.aptoslabs.com/txn/${txnHash}?network=devnet`;
  };

  return {
    message,
    loading,
    error,
    txnInProgress,
    txnHash,
    getExplorerUrl,
    submitMessage
  };
}
