import React from 'react';

export default function InfoSection() {
  return (
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
  );
}
