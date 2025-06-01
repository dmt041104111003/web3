import React, { useState, useEffect } from 'react';

export default function TransactionHistory({ 
  currentTransactions, 
  isLoadingHistory, 
  totalPages, 
  currentPage, 
  paginate, 
  copyToClipboard,
  formatAmount,
  totalTransactions,
  refreshTransactions
}) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    if (!isLoadingHistory) {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }
  }, [isLoadingHistory, currentTransactions]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error) {
      console.error('Lỗi khi làm mới lịch sử giao dịch:', error);
    }
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
      <div className="flex flex-col mb-5">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Lịch sử giao dịch
          </h2>
          {!isLoadingHistory && currentTransactions.length > 0 && (
            <span className="text-sm bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-medium">{totalTransactions} giao dịch</span>
          )}
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-500 italic">
            Cập nhật lần cuối: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={isLoadingHistory || isRefreshing}
            className={`flex items-center text-sm px-3 py-1.5 rounded-md transition-all ${isLoadingHistory || isRefreshing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
          </button>
        </div>
        <div className="h-1 w-20 bg-indigo-100 rounded-full"></div>
      </div>
      
      {currentTransactions.length > 0 ? (
        <>
          <div className="divide-y divide-gray-200 mb-4">
            {currentTransactions.map((tx, index) => (
              <div key={index} className="py-4 px-4 hover:bg-gray-50 transition-colors rounded-lg mb-2 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${tx.status === 'thành công' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.status === 'thành công' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 flex items-center">
                        {formatAmount(tx.amount)} APT
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${tx.status === 'thành công' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-medium">
                    Mạng: {tx.network}
                  </div>
                </div>
                <div className="mb-3 bg-gray-50 p-2 rounded-md border border-gray-100">
                  <div className="text-sm text-gray-600 mb-1">Người nhận:</div>
                  <div 
                    className="text-sm font-mono text-gray-800 cursor-pointer hover:text-indigo-600 flex items-center" 
                    onClick={() => copyToClipboard(tx.recipient, 'Đã sao chép địa chỉ người nhận')}
                    title="Nhấp để sao chép"
                  >
                    {tx.recipient.length > 30 ? `${tx.recipient.substring(0, 15)}...${tx.recipient.substring(tx.recipient.length - 15)}` : tx.recipient}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-end items-center space-x-3">
                  <button 
                    onClick={() => copyToClipboard(tx.hash, 'Đã sao chép hash giao dịch')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center py-1 px-2 hover:bg-indigo-50 rounded transition-colors"
                    title="Sao chép hash"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Sao chép hash
                  </button>
                  <a 
                    href={`https://explorer.aptoslabs.com/txn/${tx.hash}?network=${tx.network.toLowerCase()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center py-1 px-2 hover:bg-indigo-50 rounded transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Xem trên Explorer
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 mb-4">
              <nav className="inline-flex rounded-lg shadow-md" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2.5 rounded-l-lg border ${currentPage === 1 ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' : 'border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(totalPages).keys()].map(number => {
                  const pageNumber = number + 1;
                  const isActive = currentPage === pageNumber;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) // Hiển thị trang trước, hiện tại và sau
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2.5 border ${isActive ? 'bg-indigo-600 text-white border-indigo-600 font-medium z-10' : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    (pageNumber === currentPage - 2 && currentPage > 3) || 
                    (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={pageNumber} className="relative inline-flex items-center px-4 py-2.5 border border-gray-200 bg-white text-gray-700">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2.5 rounded-r-lg border ${currentPage === totalPages ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' : 'border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
                >
                  <span className="sr-only">Tiếp</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="py-10 text-center">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 font-medium">Chưa có giao dịch nào được thực hiện</p>
              <p className="text-gray-400 text-sm mt-1">Các giao dịch của bạn sẽ xuất hiện ở đây</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
