import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import type { UserRole } from "@/lib/train-data";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/train-data";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход — EcoPlan Hub" },
      { name: "description", content: "Вход в систему планирования расходов поездов" },
    ],
  }),
  component: LoginPage,
});

const ROLES: UserRole[] = ["manager", "analyst", "director"];

const ROLE_ICONS: Record<UserRole, string> = {
  manager: "📊",
  analyst: "📈",
  director: "👔",
};

function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("manager");

  const handleLogin = () => {
    sessionStorage.setItem("demo_auth", "true");
    sessionStorage.setItem("demo_role", selectedRole);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm border-2">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-3xl">🚂</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">EcoPlan Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">Система планирования расходов поездов</p>
          </div>

          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Выберите роль</p>
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                  selectedRole === role
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-xl">{ROLE_ICONS[role]}</span>
                <div>
                  <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                  <p className="text-[11px] text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              </button>
            ))}
          </div>

          <Button onClick={handleLogin} className="w-full h-12 text-base gap-2">
            <LogIn className="h-5 w-5" />
            Войти как {ROLE_LABELS[selectedRole].toLowerCase()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
