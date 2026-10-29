"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Sun, Bell, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verifica tema salvo ou padrão do sistema
    const isDarkMode =
      localStorage.getItem("pa_theme") === "dark" ||
      (!localStorage.getItem("pa_theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("pa_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("pa_theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-health-primary">
            Ecosistema Habitus
          </span>
          <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
            Visão Unificada de Saúde, Treinos e Finanças
          </h2>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* IA Shortcut */}
        <Link
          href="/assistant"
          className="hidden sm:flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-gemini-purple/10 to-gemini-cyan/10 px-3 py-1.5 text-xs font-medium text-gemini-purple dark:text-gemini-cyan border border-gemini-purple/20 hover:border-gemini-purple/40 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Aurora Briefing</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* User status */}
        <div className="flex items-center pl-2 sm:border-l sm:border-border">
          <div className="h-2 w-2 rounded-full bg-health-primary mr-2 animate-ping" />
          <span className="text-xs font-medium text-foreground hidden md:inline">
            {user?.name?.split(" ")[0] || "Online"}
          </span>
        </div>
      </div>
    </header>
  );
}
