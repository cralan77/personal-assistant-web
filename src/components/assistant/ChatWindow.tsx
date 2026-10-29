"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User as UserIcon, Bot, Dumbbell, Wallet, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types";
import { assistantService } from "@/lib/api/services";
import { MarkdownMessage } from "./MarkdownMessage";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      content:
        "Olá! Sou a Aurora, sua assistente pessoal integrada no Habitus. Posso te orientar sobre recuperação e zonas de frequência cardíaca dos seus treinos, evolução da sua composição corporal e planejamento das suas finanças. Como posso te ajudar hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [contextType, setContextType] = useState<"ALL" | "HEALTH" | "FINANCE">("ALL");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Carrega histórico de conversas do usuário ao abrir/recarregar a tela
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const history = await assistantService.getChatHistory();
        if (isMounted && history.length > 0) {
          setMessages(history);
        }
      } catch (err) {
        console.warn("Não foi possível carregar histórico de conversas do servidor:", err);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputText;
    if (!prompt.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      content: prompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      contextType,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const reply = await assistantService.sendMessage(prompt, contextType);
      const assistantMessage: ChatMessage = {
        id: "ast-" + Date.now(),
        sender: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        contextType,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      const isTimeout = err?.code === "ECONNABORTED" || err?.message?.includes("timeout");
      const errorMessageText = isTimeout
        ? "⏳ O assistente demorou para responder. Sua solicitação pode já ter sido processada em segundo plano. Por favor, atualize a página ou tente novamente."
        : "⚠️ Ocorreu uma instabilidade momentânea ao processar sua mensagem. Por favor, tente enviar novamente.";

      const assistantErrorMessage: ChatMessage = {
        id: "ast-err-" + Date.now(),
        sender: "assistant",
        content: errorMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        contextType,
      };
      setMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = async () => {
    if (isTyping) return;
    try {
      await assistantService.clearChatHistory();
    } catch (err) {
      console.warn("Falha ao limpar histórico no servidor:", err);
    }
    setMessages([
      {
        id: "msg-welcome-" + Date.now(),
        sender: "assistant",
        content:
          "Olá! Nova conversa iniciada. Como posso te orientar hoje sobre seus treinos, medidas corporais ou finanças?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const quickPrompts = [
    { text: "Como estão minhas medidas corporais?", icon: Dumbbell, ctx: "HEALTH" as const },
    { text: "Como está minha prontidão de treino hoje?", icon: Dumbbell, ctx: "HEALTH" as const },
    { text: "Qual a previsão das contas e despesas deste mês?", icon: Wallet, ctx: "FINANCE" as const },
    { text: "Me dê um resumo integrado de saúde e finanças.", icon: Sparkles, ctx: "ALL" as const },
  ];

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Chat Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-muted/40 p-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-gemini-purple via-gemini-blue to-gemini-cyan text-white shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Aurora Personal Assistant
              <span className="rounded-full bg-gemini-purple/20 px-2 py-0.5 text-[10px] font-semibold text-gemini-purple dark:text-gemini-cyan">
                Ativo
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Inteligência integrada aos seus treinos e finanças
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Nova Conversa Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="h-8 px-2.5 text-xs font-medium border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 shadow-none"
            title="Limpar histórico recente de conversa e iniciar um novo chat (mantendo as memórias de longo prazo)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Nova Conversa</span>
          </Button>

          {/* Context Tabs Selector */}
          <div className="flex items-center space-x-1 rounded-xl bg-background p-1 border border-border">
            <button
              onClick={() => setContextType("ALL")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                contextType === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setContextType("HEALTH")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                contextType === "HEALTH"
                  ? "bg-health-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Saúde & Cardio
            </button>
            <button
              onClick={() => setContextType("FINANCE")}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                contextType === "FINANCE"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Finanças
            </button>
          </div>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-r from-gemini-purple to-gemini-blue text-white shadow-sm"
                }`}
              >
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                    : "bg-muted/60 text-foreground border border-border/50 rounded-tl-none shadow-sm"
                }`}
              >
                <div className="text-sm">
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <MarkdownMessage content={message.content} />
                  )}
                </div>
                <span
                  className={`mt-1.5 block text-[10px] ${
                    isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-gemini-purple to-gemini-blue text-white text-xs">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-muted/60 border border-border/50 px-4 py-3 text-xs text-muted-foreground flex items-center space-x-2">
              <span className="flex space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gemini-purple animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-gemini-blue animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gemini-cyan animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>Aurora pensando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="border-t border-border/50 bg-muted/20 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap">
          Sugestões:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setContextType(qp.ctx);
              handleSendMessage(qp.text);
            }}
            className="flex items-center space-x-1.5 rounded-full bg-card border border-border/80 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-health-primary/50 whitespace-nowrap transition-all"
          >
            <qp.icon className="h-3 w-3 text-health-primary" />
            <span>{qp.text}</span>
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="border-t border-border bg-card p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Pergunte ao assistente sobre ${
              contextType === "HEALTH"
                ? "treinos, batimentos e medidas..."
                : contextType === "FINANCE"
                ? "contas a pagar, saldo e despesas..."
                : "saúde ou finanças..."
            }`}
            className="flex-1 h-11"
            disabled={isTyping}
          />
          <Button
            type="submit"
            className="h-11 px-5 bg-gradient-to-r from-gemini-purple via-gemini-blue to-gemini-cyan text-white shadow-md hover:opacity-95"
            disabled={!inputText.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensagem</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
