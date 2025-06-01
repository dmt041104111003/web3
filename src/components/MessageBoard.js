import { useState } from 'react';
import { useWallet } from '../components/WalletProvider';
import { useMessageBoard } from '../hooks/useMessageBoard';
import Link from 'next/link';

export default function MessageBoard() {
  const { isConnected } = useWallet();
  const { message, loading, error, txnInProgress, txnHash, getExplorerUrl, submitMessage } = useMessageBoard();
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await submitMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {/* Current Message Display */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-800 mb-1">Tin nhắn hiện tại</h3>
        <p className="text-sm text-gray-500">Tin nhắn mới nhất trên blockchain</p>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Đang tải tin nhắn...</p>
        </div>
      ) : (
        <div className="p-6 min-h-[120px] flex items-center justify-center">
          <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-indigo-100 shadow-sm">
            {message ? (
              <p className="text-gray-800 font-medium">{message}</p>
            ) : (
              <div className="text-center py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-2 text-gray-500 italic">Chưa có tin nhắn nào.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {txnHash && (
        <div className="mx-6 mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Giao dịch đã được gửi!</span>
            </div>
            <div className="text-sm mt-1 text-blue-600 ml-7">Mã giao dịch: {txnHash.slice(0, 10)}...{txnHash.slice(-6)}</div>
          </div>
          <a 
            href={getExplorerUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm hover:shadow-md text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Xem trên Explorer
          </a>
        </div>
      )}

      {/* New Message Form */}
      <div className="p-6 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn mới
            </label>
            <textarea
              id="message"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Nhập tin nhắn của bạn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected || txnInProgress}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              isConnected && !txnInProgress
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-sm hover:shadow-md'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isConnected || txnInProgress}
          >
            {txnInProgress ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Đang xử lý giao dịch...
              </span>
            ) : !isConnected ? (
              'Kết nối ví để đăng tin nhắn'
            ) : (
              'Đăng tin nhắn mới'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
