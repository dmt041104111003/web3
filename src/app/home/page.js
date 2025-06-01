'use client';

import { useWallet } from "../../components/WalletProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isConnected, connectWallet } = useWallet();
  const router = useRouter();




  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
          <h1 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Aptos Devnet Demo</h1>
          
          <div className="mb-10 text-center">
            <p className="text-lg text-gray-700 mb-6">
              Chào mừng đến với ứng dụng demo Aptos Devnet. Đây là một ứng dụng đơn giản để kết nối với ví Petra và tương tác với mạng Aptos Devnet.
            </p>
            <div className="flex justify-center">
              <div className="inline-flex bg-blue-50 rounded-lg p-1">
                <div className="px-4 py-2 text-sm font-medium text-blue-700 bg-white rounded-md shadow-sm">
                  Aptos Devnet
                </div>
                <div className="px-4 py-2 text-sm font-medium text-blue-600">
                  Web3 Demo
                </div>
              </div>
            </div>
          </div>

          

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thông tin về Aptos
            </h3>
            <p className="text-gray-600 mb-2">
              Aptos là một blockchain Layer 1 mới, được thiết kế để tối ưu hóa về mặt bảo mật, khả năng mở rộng và độ tin cậy.
            </p>
            <p className="text-gray-600">
              Ví Petra là ví chính thức của Aptos, cho phép người dùng tương tác với các ứng dụng trên mạng Aptos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
