import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { Types } from 'aptos';

export default function TransactionForm({ 
  saveTransactionToHistory, 
  fetchTransactionHistory, 
  setIsSubmitting, 
  isSubmitting, 
  formatAmount, 
  formatUSD,
  copyToClipboard 
}) {
  const { account, network, signAndSubmitTransaction, balance } = useWallet();
  const publicKey = account?.publicKey;
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [aptPrice, setAptPrice] = useState(10);
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  const [inputMode, setInputMode] = useState('apt');
  
  useEffect(() => {
    const fetchAptPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd');
        const data = await response.json();
        if (data && data.aptos && data.aptos.usd) {
          setAptPrice(data.aptos.usd);
        }
      } catch (error) {
        console.error('Lỗi khi lấy giá APT:', error);
      }
    };
    
    fetchAptPrice();
    const intervalId = setInterval(fetchAptPrice, 60000); 
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleAptAmountChange = (value) => {
    setInputMode('apt');
    setAmount(value);
    
    if (value && !isNaN(value)) {
      const usdValue = (parseFloat(value) * aptPrice).toFixed(2);
      setUsdAmount(usdValue);
    } else {
      setUsdAmount('');
    }
  };
  
  const handleUsdAmountChange = (value) => {
    setInputMode('usd');
    setUsdAmount(value);
    
    if (value && !isNaN(value)) {
      const aptValue = (parseFloat(value) / aptPrice).toFixed(6);
      setAmount(aptValue);
    } else {
      setAmount('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      setTxError('Vui lòng nhập địa chỉ người nhận và số lượng APT');
      return;
    }
    
    if (parseFloat(amount) <= 0) {
      setTxError('Số lượng APT phải lớn hơn 0');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(balance)) {
      setTxError('Số dư không đủ');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setTxError('');
      setTxSuccess(false);
      setTxHash('');
      
      const transaction = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [recipient, (parseFloat(amount) * 100000000).toString()]
      };
      
      const { pendingTransaction, txnResult } = await signAndSubmitTransaction(transaction);
      
      setTxHash(pendingTransaction.hash);
      setTxSuccess(true);
      
      saveTransactionToHistory({
        hash: pendingTransaction.hash,
        recipient: recipient,
        amount: amount,
        status: 'thành công'
      });
      
      setRecipient('');
      setAmount('');
      
      fetchTransactionHistory();
      
    } catch (error) {
      console.error('Lỗi khi gửi giao dịch:', error);
      setTxError(error.message || 'Lỗi không xác định khi gửi giao dịch');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-blue-500/10 rounded-xl border border-indigo-200 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white mr-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Số dư ví</h3>
              <div className="text-2xl font-bold text-indigo-700">{formatAmount(balance)} <span className="text-indigo-500">APT</span></div>
              <div className="text-sm font-medium text-gray-600 mt-0.5">≈ <span className="text-green-600">${(parseFloat(balance || 0) * aptPrice).toFixed(2)} USD</span></div>
            </div>
          </div>
          <div className="bg-white px-5 py-4 rounded-lg shadow-md border border-indigo-100">
            <div className="flex items-center text-sm font-medium text-indigo-700 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              Địa chỉ ví
            </div>
            <div 
              className="text-sm font-mono text-gray-800 truncate max-w-[200px] sm:max-w-[300px] cursor-pointer hover:text-indigo-600 flex items-center bg-indigo-50 px-3 py-2 rounded-md transition-colors"
              onClick={() => copyToClipboard(account?.address, 'Đã sao chép địa chỉ ví')}
              title="Nhấp để sao chép"
            >
              {account?.address}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 mt-4 shadow-md">
          <div className="flex items-center text-sm font-medium text-indigo-700 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Public Key
          </div>
          <div className="flex items-start bg-white p-2 rounded-md border border-indigo-100">
            <span 
              className="font-mono text-xs text-gray-800 break-all cursor-pointer hover:text-indigo-600 flex-grow px-2 py-1"
              onClick={() => copyToClipboard(publicKey, 'Đã sao chép public key')}
              title="Nhấp để sao chép"
            >
              {publicKey}
            </span>
            <button 
              onClick={() => copyToClipboard(publicKey, 'Đã sao chép public key')}
              className="ml-2 p-1.5 text-indigo-600 hover:text-indigo-800 flex-shrink-0 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Gửi APT</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="recipient" className="flex items-center text-sm font-medium text-gray-800 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Địa chỉ người nhận
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full pl-10 pr-10 py-3.5 border border-indigo-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
                disabled={isSubmitting}
              />
              {recipient && (
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 bg-white rounded-full p-1 hover:bg-indigo-50 transition-colors"
                  onClick={() => setRecipient('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="amount" className="flex items-center text-sm font-medium text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Số lượng
              </label>
              <div className="flex border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${inputMode === 'apt' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-indigo-50'}`}
                  onClick={() => setInputMode('apt')}
                >
                  APT
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${inputMode === 'usd' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-indigo-50'}`}
                  onClick={() => setInputMode('usd')}
                >
                  USD
                </button>
              </div>
            </div>
            
            {inputMode === 'apt' && (
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => handleAptAmountChange(e.target.value)}
                  placeholder="0.0"
                  step="0.000001"
                  min="0"
                  className="w-full pl-10 pr-16 py-3.5 border border-indigo-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md">APT</span>
                </div>
              </div>
            )}
            
            {inputMode === 'usd' && (
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="usdAmount"
                  value={usdAmount}
                  onChange={(e) => handleUsdAmountChange(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-16 py-3.5 border border-indigo-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-800"
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">USD</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">
                {inputMode === 'apt' && amount ? `≈ $${(parseFloat(amount) * aptPrice).toFixed(2)} USD` : ''}
                {inputMode === 'usd' && usdAmount ? `≈ ${(parseFloat(usdAmount) / aptPrice).toFixed(6)} APT` : ''}
              </div>
              <div className="text-xs text-gray-500">
                1 APT = ${aptPrice.toFixed(2)} USD
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className={`px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Gửi giao dịch
                </div>
              )}
            </button>

          </div>
        </form>
        
        {txError && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 shadow-sm flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-red-800 mb-1">Lỗi giao dịch</div>
              <div className="text-red-700">{txError}</div>
            </div>
          </div>
        )}
        
        {txSuccess && (
          <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 shadow-sm flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-green-800 mb-1">Giao dịch thành công!</div>
              <div className="text-sm">
                Hash giao dịch: 
                <a 
                  href={`https://explorer.aptoslabs.com/txn/${txHash}?network=${network.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-indigo-600 hover:text-indigo-800 font-mono break-all inline-flex items-center"
                >
                  {txHash.length > 20 ? `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 10)}` : txHash}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <button 
                onClick={() => copyToClipboard(txHash, 'Đã sao chép hash giao dịch')}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sao chép hash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
