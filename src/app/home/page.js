'use client';

import { useWallet } from "../../components/WalletProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isConnected, connectWallet } = useWallet();
  const router = useRouter();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    }
  };

  const handleViewWalletDetails = () => {
    router.push('/wallet');
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Kết nối ví Petra</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Kết nối ví Petra của bạn để bắt đầu tương tác với mạng Aptos Devnet.
              </p>
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Kết nối Petra Wallet
                </button>
              ) : (
                <div className="flex items-center justify-center text-green-600 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã kết nối
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Thông tin ví</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Xem chi tiết thông tin ví của bạn, bao gồm địa chỉ và public key.
              </p>
              <button
                onClick={handleViewWalletDetails}
                className={`w-full ${isConnected ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center`}
                disabled={!isConnected}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Xem thông tin ví
              </button>
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
