import React from 'react';

export default function WelcomeSection() {
  return (
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
    </div>
  );
}
