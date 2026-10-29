"use client";

import { ChatWindow } from "@/components/assistant/ChatWindow";
import { Sparkles } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-gemini-purple to-gemini-blue text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Aurora Personal Assistant
          </h2>
          <p className="text-sm text-muted-foreground">
            Inteligência contextual com acesso aos seus treinos, métricas corporais e lançamentos financeiros.
          </p>
        </div>
      </div>

      {/* Main Interactive Chat Window */}
      <ChatWindow />
    </div>
  );
}
