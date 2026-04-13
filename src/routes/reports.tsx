import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Отчёты — EcoPlan Hub" },
      { name: "description", content: "Отчёты по расходам пассажирских поездов" },
    ],
  }),
  component: ReportsGuard,
});

function ReportsGuard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!sessionStorage.getItem("demo_auth")) {
        navigate({ to: "/login" });
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
            <h1 className="text-sm font-semibold text-foreground">Отчёты</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <ReportsPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ReportsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Отчёты по рейсам
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Для формирования отчёта выполните расчёт на странице «Расчёт», затем вернитесь сюда.
          </p>

          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Нет сохранённых расчётов</p>
            <p className="text-xs text-muted-foreground mt-1">
              Выполните расчёт расходов, чтобы сформировать отчёт
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Доступные отчёты</p>
            {[
              { title: "Отчёт по рейсу", desc: "Полная разбивка расходов по категориям" },
              { title: "Себестоимость рейса", desc: "Расходы на вагон и пассажира" },
              { title: "Отчёт для руководства", desc: "Сводная информация с отклонениями" },
            ].map((r) => (
              <div key={r.title} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" disabled>
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
