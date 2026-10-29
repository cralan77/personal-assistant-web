"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Dumbbell,
  Wallet,
  Sparkles,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Treinos & Cardio",
    href: "/workouts",
    icon: Dumbbell,
  },
  {
    name: "Composição Corporal",
    href: "/body",
    icon: Activity,
  },
  {
    name: "Finanças",
    href: "/finance",
    icon: Wallet,
  },
  {
    name: "Assistente Aurora",
    href: "/assistant",
    icon: Sparkles,
    highlight: true,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Brand Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-health-primary text-white shadow-md shadow-health-primary/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Habitus</h1>
            <p className="text-xs text-muted-foreground">Saúde & Finanças</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? item.highlight
                    ? "bg-gradient-to-r from-gemini-purple to-gemini-blue text-white shadow-md shadow-gemini-purple/20"
                    : "bg-health-primary text-white shadow-md shadow-health-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-white"
                    : item.highlight
                    ? "text-gemini-purple dark:text-gemini-cyan"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {user?.name ? user.name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name || "Usuário"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email || "conectado"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Encerrar Sessão"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
