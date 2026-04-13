import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TariffSettingsBlock } from "@/components/TariffSettingsBlock";
import { DEFAULT_TARIFFS, type TariffSettings } from "@/lib/train-data";
import { canEditSettings } from "@/lib/roles";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — EcoPlan Hub" },
      { name: "description", content: "Настройки тарифов системы" },
    ],
  }),
  component: SettingsGuard,
});

function SettingsGuard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!sessionStorage.getItem("demo_auth")) {
        navigate({ to: "/login" });
      } else if (!canEditSettings()) {
        navigate({ to: "/" });
      } else {
        setReady(true);
      }
    }
  }, [navigate]);

  if (!ready) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 px-2">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-sm font-semibold text-foreground">Настройки тарифов</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <SettingsPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function SettingsPage() {
  const [tariffs, setTariffs] = useState<TariffSettings>(DEFAULT_TARIFFS);

  const handleTariffChange = (key: keyof TariffSettings, value: number) => {
    setTariffs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <TariffSettingsBlock tariffs={tariffs} onTariffChange={handleTariffChange} />
    </div>
  );
}
