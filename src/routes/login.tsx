import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="w-full max-w-sm">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6">
          <div className="h-12 w-12 rounded bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">EP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">EcoPlan Hub</h1>
            <p className="text-xs text-muted-foreground mt-1">Система планирования расходов пассажирских поездов</p>
          </div>

          <div className="w-full space-y-2">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Выберите роль</p>
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center gap-3 rounded border p-3 text-left transition-all ${
                  selectedRole === role
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                  <p className="text-[11px] text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              </button>
            ))}
          </div>

          <Button onClick={handleLogin} className="w-full h-10 gap-2">
            Войти как {ROLE_LABELS[selectedRole].toLowerCase()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
