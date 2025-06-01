'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/components/WalletProvider';
import useTransactions from '@/hooks/useTransactions';
import useClipboard from '@/hooks/useClipboard';
import TransactionForm from '@/components/transaction/TransactionForm';
import TransactionHistory from '@/components/transaction/TransactionHistory';

export default function TransactionPage() {
  const { isConnected, connectWallet } = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const { copyMessage, isVisible, copyToClipboard } = useClipboard();
  
  const {
    transactionHistory,
    currentTransactions,
    isLoadingHistory,
    currentPage,
    totalPages,
    paginate,
    saveTransactionToHistory,
    fetchTransactionHistory,
    refreshTransactions
  } = useTransactions();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatAmount = (amount) => {
    if (!amount) return '0';
    
    const aptAmount = parseFloat(amount) / 100000000;
    
    return aptAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };

  const formatUSD = (aptAmount) => {
    if (!aptAmount) return '0.00';
    
    const usdRate = 10;
    const usdAmount = parseFloat(aptAmount) * usdRate;
    return usdAmount.toFixed(2);
  };

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-blue-50 to-indigo-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Aptos Devnet Demo</h1>
        <div className="text-center text-gray-700 text-lg mb-10">
          Chuyển APT đến địa chỉ khác trên mạng Aptos Devnet một cách nhanh chóng và dễ dàng
        </div>
        
        {!isConnected ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="mb-6 text-gray-700 text-lg">Vui lòng kết nối ví Petra để gửi giao dịch</p>
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Kết nối Petra Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <TransactionForm 
                saveTransactionToHistory={saveTransactionToHistory}
                fetchTransactionHistory={fetchTransactionHistory}
                setIsSubmitting={setIsSubmitting}
                isSubmitting={isSubmitting}
                formatAmount={formatAmount}
                formatUSD={formatUSD}
                copyToClipboard={copyToClipboard}
              />
            </div>
            <div>
              {showHistory ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="absolute top-6 right-6 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center z-10 bg-white bg-opacity-90 px-3 py-1.5 rounded-md shadow-sm border border-indigo-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Ẩn lịch sử
                  </button>
                  <TransactionHistory 
                    currentTransactions={currentTransactions}
                    isLoadingHistory={isLoadingHistory}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    paginate={paginate}
                    copyToClipboard={copyToClipboard}
                    formatAmount={formatAmount}
                    totalTransactions={transactionHistory.length}
                    refreshTransactions={refreshTransactions}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 flex flex-col items-center justify-center min-h-[200px]">
                  <button 
                    onClick={() => setShowHistory(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center px-4 py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Hiển thị lịch sử giao dịch
                  </button>
                </div>
              )}              
            </div>
          </div>
        )}
        
        {copyMessage && (
          <div className={`fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-200" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{copyMessage}</span>
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link href="/home" className="inline-flex items-center px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại Trang chủ
          </Link>
        </div>
        </div>
      </main>
      

    </div>
  );
}
