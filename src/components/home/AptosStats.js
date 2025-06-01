import React, { useState, useEffect } from 'react';

export default function AptosStats() {
  const [stats, setStats] = useState({
    price: '---',
    marketCap: '---',
    totalSupply: '---',
    transactions: '---',
    loading: true
  });

  useEffect(() => {
    const fetchAptosStats = async () => {
      try {
        setTimeout(() => {
          setStats({
            price: '$10.25',
            marketCap: '$1.02B',
            totalSupply: '1B APT',
            transactions: '12.5M+',
            loading: false
          });
        }, 1500);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin Aptos:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAptosStats();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Thống kê Aptos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`bg-blue-50 rounded-lg p-4 text-center ${stats.loading ? 'animate-pulse' : ''}`}>
          <p className="text-sm text-gray-500 mb-1">Giá hiện tại</p>
          <p className="text-xl font-bold text-blue-700">{stats.price}</p>
        </div>
        
        <div className={`bg-indigo-50 rounded-lg p-4 text-center ${stats.loading ? 'animate-pulse' : ''}`}>
          <p className="text-sm text-gray-500 mb-1">Vốn hóa thị trường</p>
          <p className="text-xl font-bold text-indigo-700">{stats.marketCap}</p>
        </div>
        
        <div className={`bg-purple-50 rounded-lg p-4 text-center ${stats.loading ? 'animate-pulse' : ''}`}>
          <p className="text-sm text-gray-500 mb-1">Tổng cung</p>
          <p className="text-xl font-bold text-purple-700">{stats.totalSupply}</p>
        </div>
        
        <div className={`bg-green-50 rounded-lg p-4 text-center ${stats.loading ? 'animate-pulse' : ''}`}>
          <p className="text-sm text-gray-500 mb-1">Tổng giao dịch</p>
          <p className="text-xl font-bold text-green-700">{stats.transactions}</p>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <a 
          href="https://explorer.aptoslabs.com/?network=mainnet" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          Xem thêm trên Aptos Explorer
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
