'use client';

import { useWallet } from "../../components/WalletProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import WelcomeSection from "@/components/home/WelcomeSection";
import InfoSection from "@/components/home/InfoSection";
import FeatureSection from "@/components/home/FeatureSection";
import AptosStats from "@/components/home/AptosStats";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const { isConnected, connectWallet } = useWallet();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <main className="flex-grow bg-gradient-to-b from-blue-50 to-indigo-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto space-y-8">
          <WelcomeSection />
          
          <FeatureSection />
          
          <AptosStats />
          
          <InfoSection />

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Tính năng DAO và Gây quỹ mới</h2>
              <p className="text-lg text-gray-600 mb-8">Khám phá các tính năng mới của chúng tôi cho phép bạn tạo và quản lý DAO NFT và chiến dịch gây quỹ trên blockchain Aptos.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">DAO NFT Platform</h3>
                  <p className="text-gray-700 mb-4">Tạo và quản lý DAO với quyền biểu quyết dựa trên NFT. Tạo proposal, bỏ phiếu và thực thi quyết định một cách minh bạch.</p>
                  <Link href="/dao" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Khám phá DAO
                  </Link>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">Nền tảng gây quỹ</h3>
                  <p className="text-gray-700 mb-4">Tạo chiến dịch gây quỹ với tính năng multisig và timelock để đảm bảo an toàn và minh bạch cho người đóng góp.</p>
                  <Link href="/fundraising" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    Khám phá gây quỹ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
