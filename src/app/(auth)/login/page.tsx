"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Activity, Lock, User as UserIcon, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/lib/api/services";
import { useAuthStore } from "@/store/use-auth-store";

const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const wasExpired = searchParams.get("expired") === "true";

  const { login } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await authService.login(values);
      login(response.token, {
        id: response.userId,
        name: response.name,
        username: response.username,
        email: response.email,
        roles: response.roles,
      });
      router.push(from);
    } catch (err: any) {
      console.error("Falha de autenticação:", err);
      setErrorMessage(
        err.response?.data?.message || err.response?.data?.error || "Credenciais inválidas ou serviço de autenticação indisponível."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue("username", "alan_finance");
    setValue("password", "Senha123456");
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-health-primary text-white shadow-xl shadow-health-primary/30">
          <Activity className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Habitus
        </h1>
        <p className="text-sm text-muted-foreground">
          Acesse seu ecossistema integrado de saúde e finanças
        </p>
      </div>

      {wasExpired && (
        <div className="flex items-center rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
          <span>Sua sessão expirou. Faça login novamente para continuar.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="border-border shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold">Entrar na Conta</CardTitle>
          <CardDescription>
            Informe seu usuário e senha cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Seu nome de usuário"
                  className="pl-9"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-health-primary hover:bg-health-dark text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Autenticando..." : "Entrar no Painel"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center text-xs text-muted-foreground hover:text-health-primary transition-colors"
            >
              <Sparkles className="mr-1 h-3 w-3 text-health-primary" />
              Preencher credencial de teste
            </button>

            <Link
              href="/register"
              className="text-xs font-medium text-health-primary hover:underline"
            >
              Criar uma conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-card to-background p-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando formulário...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
