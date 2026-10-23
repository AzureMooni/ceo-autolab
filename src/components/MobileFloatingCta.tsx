"use client";

import React, { useEffect, useState } from "react";
import { Mic, Sparkles } from "lucide-react";

interface MobileFloatingCtaProps {
  hasGeneratedData: boolean;
}

export default function MobileFloatingCta({ hasGeneratedData }: MobileFloatingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 200px
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide floating CTA if the user has generated data (PublishActionBar will take over)
  if (hasGeneratedData || !visible) return null;

  const scrollToWizard = () => {
    document.getElementById("wizard")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden animate-fade-in">
      <button
        onClick={scrollToWizard}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-brand py-3.5 px-5 font-extrabold text-obsidian-950 shadow-2xl shadow-emerald-brand/40 active:scale-95 transition"
      >
        <Mic className="h-5 w-5" />
        <span>1분 말로 하는 무료 원고 쓰기</span>
        <Sparkles className="h-4 w-4" />
      </button>
    </div>
  );
}
