import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { loadCalculations, type SavedCalculation } from "@/lib/train-data";
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
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 px-2">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-sm font-semibold text-foreground">Аналитика</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <AnalyticsPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const COLORS = ["#1e3c78", "#228b22", "#b22222", "#6a5acd", "#d2691e", "#008b8b"];

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

  // Aggregate expense breakdown
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

  // Train comparison
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
      train: `№${train}`,
      revenue: Math.round(data.revenue / data.count),
      expenses: Math.round(data.expenses / data.count),
    }));
  }, [calculations]);

  if (calculations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Нет данных для аналитики</p>
            <p className="text-xs text-muted-foreground mt-1">Сохраните расчёты для отображения графиков</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Фильтр:</span>
        <button
          onClick={() => setSelectedTrain("all")}
          className={`text-xs rounded-lg border px-3 py-1.5 transition-colors ${selectedTrain === "all" ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}
        >
          Все поезда
        </button>
        {trainNumbers.map((num) => (
          <button
            key={num}
            onClick={() => setSelectedTrain(num)}
            className={`text-xs rounded-lg border px-3 py-1.5 transition-colors ${selectedTrain === num ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}
          >
            №{num}
          </button>
        ))}
      </div>

      {/* Expense breakdown pie chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Структура расходов
            <Badge variant="secondary" className="ml-auto text-xs">{filtered.length} расчёт(ов)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }: Record<string, unknown>) => `${name ?? ""} (${((Number(percent) || 0) * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {expenseBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${Number(v).toLocaleString("ru-RU")} ₸`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Train comparison bar chart */}
      {trainComparison.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Сравнение поездов (средние)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trainComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="train" fontSize={12} />
                <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} />
                <Tooltip formatter={(v) => `${Number(v).toLocaleString("ru-RU")} ₸`} />
                <Legend />
                <Bar dataKey="revenue" name="Доходы" fill="#228b22" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Расходы" fill="#b22222" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Ср. доход</p>
            <p className="text-lg font-bold text-success">
              {Math.round(filtered.reduce((s, c) => s + c.financial.totalRevenue, 0) / filtered.length).toLocaleString("ru-RU")} ₸
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Ср. расходы</p>
            <p className="text-lg font-bold text-destructive">
              {Math.round(filtered.reduce((s, c) => s + c.results.total, 0) / filtered.length).toLocaleString("ru-RU")} ₸
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Ср. маржа</p>
            <p className="text-lg font-bold">
              {(filtered.reduce((s, c) => s + c.financial.profitMargin, 0) / filtered.length).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
