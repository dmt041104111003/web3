'use client';

import { useWallet } from "./WalletProvider";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AptosLogo from './AptosLogo';

export default function Navbar() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isPetraInstalled = () => {
    return typeof window !== 'undefined' && window.aptos;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      setMobileMenuOpen(false); 
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnectWallet();
      setMobileMenuOpen(false); 
    } catch (error) {
      console.error('Lỗi ngắt kết nối:', error);
    }
  };

  const navigateTo = (path) => {
    router.push(path);
    setMobileMenuOpen(false); 
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2 bg-gray-900 shadow-lg' : 'py-4 bg-gradient-to-r from-slate-900 to-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div 
              onClick={() => navigateTo('/home')} 
              className="flex items-center cursor-pointer"
            >
              <AptosLogo className="scale-110" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-1 mr-4">
              <button 
                onClick={() => navigateTo('/home')} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${pathname === '/home' ? 'bg-white text-indigo-700' : 'text-white hover:bg-indigo-600'} transition-colors duration-200`}
              >
                Trang chủ
              </button>
              

              
              <button 
                onClick={() => navigateTo('/transaction')} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${pathname === '/transaction' ? 'bg-white text-indigo-700' : 'text-white hover:bg-indigo-600'} transition-colors duration-200`}
              >
                Gửi giao dịch
              </button>
            </div>

            {!isPetraInstalled() ? (
              <a 
                href="https://petra.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Cài đặt Petra
              </a>
            ) : isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium bg-indigo-600 text-white py-2 px-4 rounded-lg border border-indigo-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatAddress(account?.address)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Ngắt kết nối
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className={`bg-white hover:bg-blue-50 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {isConnecting ? 'Đang kết nối...' : 'Kết nối ví'}
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            {isConnected && (
              <span className="text-xs font-medium bg-indigo-600 text-white py-1 px-2 rounded-lg border border-indigo-500 mr-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatAddress(account?.address)}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-blue-100 focus:outline-none focus:text-blue-100"
              aria-expanded="false"
            >
              <span className="sr-only">Mở menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-800 shadow-lg">
          <button
            onClick={() => navigateTo('/home')}
            className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${pathname === '/home' ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
          >
            Trang chủ
          </button>

          <button
            onClick={() => navigateTo('/transaction')}
            className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${pathname === '/transaction' ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
          >
            Gửi giao dịch
          </button>
          
          <div className="pt-2">
            {!isPetraInstalled() ? (
              <a
                href="https://petra.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-3 rounded-md transition-colors duration-200"
              >
                Cài đặt Petra Wallet
              </a>
            ) : isConnected ? (
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md transition-colors duration-200"
              >
                Ngắt kết nối
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className={`w-full bg-white hover:bg-gray-100 text-indigo-700 font-medium py-2 px-3 rounded-md transition-colors duration-200 ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isConnecting ? 'Đang kết nối...' : 'Kết nối Petra Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
