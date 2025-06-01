'use client';

import { useWallet } from "@/components/WalletProvider";
import MessageBoard from "@/components/MessageBoard";
import TransactionHistory from "@/components/TransactionHistory";
import Footer from "@/components/Footer";

export default function MessageBoardPage() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-blue-50 to-indigo-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Đăng tin</h1>

            <p className="text-xl text-gray-600">
              Đăng và xem tin nhắn được lưu trữ trên blockchain Aptos
            </p>
          </div>

          {!isConnected ? (
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg text-center border border-indigo-100">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Kết nối ví của bạn</h2>
              <p className="text-gray-600 mb-6">
                Để tương tác với bảng tin, bạn cần kết nối ví Aptos của mình.
              </p>
              <button
                onClick={() => window.aptos?.connect()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Kết nối ví Aptos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Đăng tin nhắn mới
                </h2>
                <MessageBoard />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Lịch sử giao dịch
                </h2>
                <TransactionHistory />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
