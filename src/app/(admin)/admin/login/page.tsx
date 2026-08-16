'use client';

import { useState, useEffect } from 'react';
import AutumnScene from './_components/AutumnScene';
import LoginCard from './_components/LoginCard';

export default function LoginPage() {
  const [sceneReady, setSceneReady] = useState(false);
  const [successStarted, setSuccessStarted] = useState(false);
  const [brighten, setBrighten] = useState(false);

  // Scene loads first, then card appears
  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSuccessStart = () => {
    setSuccessStarted(true);
    setBrighten(true);
  };

  return (
    <div className={`relative min-h-screen overflow-hidden select-none transition-all duration-1000 ${brighten ? 'brightness-110' : ''}`}>
      {/* Animated Autumn Scene */}
      <AutumnScene />

      {/* Login Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {sceneReady && <LoginCard onSuccessStart={handleSuccessStart} />}
      </div>

      {/* Skip to content - accessibility */}
      <a
        href="#login-email"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[#079E96] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to login form
      </a>
    </div>
  );
}
