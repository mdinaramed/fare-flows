import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadCalculations, type SavedCalculation } from "@/lib/train-data";
import type { PieLabelRenderProps } from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Аналитика — EcoPlan Hub" },
      { name: "description", content: "Аналитика расходов пассажирских поездов" },
    ],
  }),
  component: AnalyticsGuard,
});

function AnalyticsGuard() {
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
            <h1 className="text-sm font-semibold">Аналитика</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <AnalyticsPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const COLORS = ["#1a3264", "#286428", "#8c1e1e", "#5a4aad", "#9a6019", "#1a6464"];

function AnalyticsPage() {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<string>("all");

  useEffect(() => {
    setCalculations(loadCalculations());
  }, []);

  const filtered = useMemo(() => {
    if (selectedTrain === "all") return calculations;
    return calculations.filter((c) => c.trainNumber === selectedTrain);
  }, [calculations, selectedTrain]);

  const trainNumbers = useMemo(() => {
    return [...new Set(calculations.map((c) => c.trainNumber))];
  }, [calculations]);

  const expenseBreakdown = useMemo(() => {
    if (filtered.length === 0) return [];
    const totals: Record<string, number> = {};
    for (const calc of filtered) {
      for (const [group, amount] of Object.entries(calc.results.byGroup)) {
        totals[group] = (totals[group] || 0) + amount;
      }
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const trainComparison = useMemo(() => {
    if (calculations.length === 0) return [];
    const byTrain: Record<string, { revenue: number; expenses: number; count: number }> = {};
    for (const calc of calculations) {
      if (!byTrain[calc.trainNumber]) byTrain[calc.trainNumber] = { revenue: 0, expenses: 0, count: 0 };
      byTrain[calc.trainNumber].revenue += calc.financial.totalRevenue;
      byTrain[calc.trainNumber].expenses += calc.results.total;
      byTrain[calc.trainNumber].count++;
    }
    return Object.entries(byTrain).map(([train, data]) => ({
      train,
      revenue: Math.round(data.revenue / data.count),
      expenses: Math.round(data.expenses / data.count),
    }));
  }, [calculations]);

  if (calculations.length === 0) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Нет данных для аналитики</p>
            <p className="text-xs text-muted-foreground mt-1">Сохраните расчёты для отображения графиков</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Фильтр:</span>
        <button
          onClick={() => setSelectedTrain("all")}
          className={`text-xs rounded border px-3 py-1.5 transition-colors ${selectedTrain === "all" ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}
        >
          Все
        </button>
        {trainNumbers.map((num) => (
          <button
            key={num}
            onClick={() => setSelectedTrain(num)}
            className={`text-xs rounded border px-3 py-1.5 transition-colors ${selectedTrain === num ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Структура расходов ({filtered.length} расчёт.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={(props: PieLabelRenderProps) => `${props.name ?? ""} ${((Number(props.percent) || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${Number(v).toLocaleString("ru-RU")} тг`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar */}
        {trainComparison.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Сравнение поездов (средние)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trainComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="train" fontSize={11} />
                  <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString("ru-RU")} тг`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Доходы" fill="#286428" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenses" name="Расходы" fill="#8c1e1e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Ср. доход</p>
            <p className="text-base font-bold text-success">
              {Math.round(filtered.reduce((s, c) => s + c.financial.totalRevenue, 0) / filtered.length).toLocaleString("ru-RU")} тг
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Ср. расходы</p>
            <p className="text-base font-bold text-destructive">
              {Math.round(filtered.reduce((s, c) => s + c.results.total, 0) / filtered.length).toLocaleString("ru-RU")} тг
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Ср. маржа</p>
            <p className="text-base font-bold">
              {(filtered.reduce((s, c) => s + c.financial.profitMargin, 0) / filtered.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
