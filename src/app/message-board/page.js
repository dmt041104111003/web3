'use client';

import { useWallet } from "@/components/WalletProvider";
import MessageBoard from "@/components/MessageBoard";
import Footer from "@/components/Footer";

export default function MessageBoardPage() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-blue-50 to-indigo-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bảng Tin Blockchain</h1>
            <p className="text-xl text-gray-600">
              Đăng và xem tin nhắn được lưu trữ trên blockchain Aptos
            </p>
          </div>

          {!isConnected ? (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-700 mb-4">
                Vui lòng kết nối ví Aptos của bạn để tương tác với bảng tin.
              </p>
              <button
                onClick={() => window.aptos?.connect()}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Kết nối ví
              </button>
            </div>
          ) : (
            <MessageBoard />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
