'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ページを一定量スクロールした際に右下にふわっと現れる「トップへ戻る」フローティングボタン
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 300px以上スクロールされたら表示
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="ページトップへ戻る"
      title="ページトップへ戻る"
      className="fixed bottom-6 right-5 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-indigo-400/80 shadow-xl shadow-black/50 backdrop-blur-md transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer no-print group scroll-to-top-btn"
    >
      <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform scroll-to-top-icon" />
    </button>
  );
}
