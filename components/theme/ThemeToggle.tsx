'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR時のハイドレーション不一致を防ぐためのプレースホルダー
  const isDark = mounted ? theme === 'dark' : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'ライトモードに切り替える' : 'ダークモードに切り替える'}
      title={isDark ? 'ライトモードに切り替える' : 'ダークモードに切り替える'}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-800/90 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700/60 shadow-sm'
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/80 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
