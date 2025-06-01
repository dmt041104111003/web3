'use client';

import { useWallet } from "../../components/WalletProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
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

  // Luôn hiển thị splash screen mỗi khi truy cập vào trang home
  
  // Xử lý khi splash screen hoàn thành
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
