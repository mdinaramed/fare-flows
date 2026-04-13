import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход — EcoPlan Hub" },
      { name: "description", content: "Вход в систему расчёта расходов поездов" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm border-2">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-3xl">🚂</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">EcoPlan Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">Система расчёта расходов поездов</p>
          </div>
          <Button
            onClick={() => {
              sessionStorage.setItem("demo_auth", "manager");
              navigate({ to: "/" });
            }}
            className="w-full h-12 text-base gap-2"
          >
            <LogIn className="h-5 w-5" />
            Войти как менеджер
          </Button>
          <p className="text-xs text-muted-foreground">Демо-режим · вход без пароля</p>
        </CardContent>
      </Card>
    </div>
  );
}
