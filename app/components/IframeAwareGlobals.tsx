"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const GlobalMusicPlayer = dynamic(() => import("./GlobalMusicPlayer"), { ssr: false });
const GlobalChat = dynamic(() => import("./GlobalChat"), { ssr: false });
const GlobalWalletHUD = dynamic(() => import("./GlobalWalletHUD"), { ssr: false });
const AutoChainSwitcher = dynamic(() => import("./AutoChainSwitcher"), { ssr: false });

export default function IframeAwareGlobals() {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  // Don't render global components if we're in an iframe
  if (isInIframe) {
    return null;
  }

  return (
    <>
      <AutoChainSwitcher />
      <GlobalMusicPlayer />
      <GlobalChat />
      <GlobalWalletHUD />
    </>
  );
}
