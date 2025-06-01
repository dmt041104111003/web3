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
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Message Board</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải tin nhắn...</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg min-h-[100px] border border-gray-200">
          {message ? (
            <p className="text-gray-800">{message}</p>
          ) : (
            <p className="text-gray-500 italic">Chưa có tin nhắn nào.</p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {txnHash && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-between">
          <div>
            <span className="font-medium">Giao dịch đã được gửi!</span>
            <div className="text-sm mt-1 text-blue-600">Mã giao dịch: {txnHash.slice(0, 10)}...{txnHash.slice(-6)}</div>
          </div>
          <a 
            href={getExplorerUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Xem trên Explorer
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Tin nhắn mới
          </label>
          <textarea
            id="message"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tin nhắn của bạn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isConnected || txnInProgress}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md font-medium ${
            isConnected && !txnInProgress
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isConnected || txnInProgress}
        >
          {txnInProgress ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
              Đang xử lý...
            </span>
          ) : !isConnected ? (
            'Kết nối ví để đăng tin nhắn'
          ) : (
            'Đăng tin nhắn'
          )}
        </button>
      </form>
    </div>
  );
}
