import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { loadCalculations, type SavedCalculation } from "@/lib/train-data";
import { generatePdfReport } from "@/lib/pdf-report";

export const Route = createFileRoute("/director")({
  head: () => ({
    meta: [
      { title: "Руководство — EcoPlan Hub" },
      { name: "description", content: "Управленческий обзор для руководства" },
    ],
  }),
  component: DirectorGuard,
});

function DirectorGuard() {
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
          <header className="h-11 flex items-center border-b bg-card/90 backdrop-blur-sm sticky top-0 z-10 px-3">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-sm font-semibold">Управленческий обзор</h1>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            <DirectorPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DirectorPage() {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);

  useEffect(() => {
    setCalculations(loadCalculations());
  }, []);

  const kpis = useMemo(() => {
    if (calculations.length === 0) {
      return { totalRevenue: 0, totalExpenses: 0, profit: 0, profitable: 0, unprofitable: 0, avgMargin: 0 };
    }
    const totalRevenue = calculations.reduce((s, c) => s + c.financial.totalRevenue, 0);
    const totalExpenses = calculations.reduce((s, c) => s + c.results.total, 0);
    const profit = totalRevenue - totalExpenses;
    const profitable = calculations.filter((c) => c.financial.financialResult >= 0).length;
    const unprofitable = calculations.length - profitable;
    const avgMargin = calculations.reduce((s, c) => s + c.financial.profitMargin, 0) / calculations.length;
    return { totalRevenue, totalExpenses, profit, profitable, unprofitable, avgMargin };
  }, [calculations]);

  const sortedReports = useMemo(
    () => [...calculations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [calculations],
  );

  if (calculations.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-10 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Нет сохранённых отчётов</p>
            <p className="text-xs text-muted-foreground mt-1">Отчёты появятся после сохранения расчётов</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fmt = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₸`;

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">
      {/* KPI Grid */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Сводные показатели
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Доходы всего" value={fmt(kpis.totalRevenue)} icon={DollarSign} tone="success" />
          <KpiCard label="Расходы всего" value={fmt(kpis.totalExpenses)} icon={Wallet} tone="destructive" />
          <KpiCard
            label={kpis.profit >= 0 ? "Прибыль" : "Убыток"}
            value={fmt(kpis.profit)}
            icon={kpis.profit >= 0 ? TrendingUp : TrendingDown}
            tone={kpis.profit >= 0 ? "success" : "destructive"}
          />
          <KpiCard label="Средняя рентабельность" value={`${kpis.avgMargin.toFixed(1)} %`} tone="neutral" />
        </div>
      </div>

      {/* Trip status */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Прибыльных рейсов</p>
              <p className="text-2xl font-bold text-success">{kpis.profitable}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success/40" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground tracking-wide">Убыточных рейсов</p>
              <p className="text-2xl font-bold text-destructive">{kpis.unprofitable}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-destructive/40" />
          </CardContent>
        </Card>
      </div>

      {/* Reports list */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Отчёты по рейсам ({sortedReports.length})
        </h2>
        <Card>
          <CardContent className="p-0 divide-y">
            {sortedReports.map((calc) => {
              const isProfit = calc.financial.financialResult >= 0;
              return (
                <div key={calc.id} className="p-3 lg:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-semibold">Поезд {calc.trainNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{calc.trainRoute}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(calc.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
                      {fmt(calc.financial.financialResult)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isProfit ? "прибыль" : "убыток"} · {calc.financial.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => generatePdfReport(calc, "executive")}
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone: "success" | "destructive" | "neutral";
}) {
  const colorClass =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
          {Icon && <Icon className={`h-3.5 w-3.5 ${colorClass} opacity-60`} />}
        </div>
        <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
