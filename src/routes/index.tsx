import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrainSearch } from "@/components/TrainSearch";
import { TrainParams } from "@/components/TrainParams";
import { ExpenseTracker } from "@/components/ExpenseTracker";
import { ResultsBlock } from "@/components/ResultsBlock";
import { Calculator } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { canEdit, canCalculate } from "@/lib/roles";
import {
  type TrainInfo,
  type RouteType,
  type TrainType,
  type TariffSettings,
  type ExpenseItem,
  type CalculationResult,
  type CalculationParams,
  DEFAULT_TARIFFS,
  createDefaultExpenses,
  calculateExpenses,
} from "@/lib/train-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoPlan Hub — Расчёт расходов" },
      { name: "description", content: "Система планирования и анализа расходов пассажирских поездов" },
    ],
  }),
  component: IndexGuard,
});

function IndexGuard() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("demo_auth")) {
        setAuthed(true);
      } else {
        navigate({ to: "/login" });
      }
      setChecked(true);
    }
  }, [navigate]);

  if (!checked || !authed) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 px-2">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-sm font-semibold text-foreground">Расчёт расходов</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <IndexPage />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function IndexPage() {
  const editAllowed = canEdit();
  const calcAllowed = canCalculate();

  const [train, setTrain] = useState<TrainInfo | null>(null);
  const [wagons, setWagons] = useState(10);
  const [passengers, setPassengers] = useState(360);
  const [routeType, setRouteType] = useState<RouteType>("social");
  const [trainType, setTrainType] = useState<TrainType>("standard");
  const [rollingStockMode, setRollingStockMode] = useState<"rent" | "depreciation">("rent");
  const [tariffs, setTariffs] = useState<TariffSettings>(DEFAULT_TARIFFS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [results, setResults] = useState<CalculationResult | null>(null);

  const getParams = useCallback(
    (t: TrainInfo): CalculationParams => ({
      wagons, passengers, routeType, trainType, rollingStockMode, train: t, tariffs,
    }),
    [wagons, passengers, routeType, trainType, rollingStockMode, tariffs]
  );

  const handleTrainFound = useCallback(
    (t: TrainInfo) => {
      setTrain(t);
      setResults(null);
      setExpenses(createDefaultExpenses({ wagons, passengers, routeType, trainType, rollingStockMode, train: t, tariffs }));
    },
    [wagons, passengers, routeType, trainType, rollingStockMode, tariffs]
  );

  const refreshExpenses = useCallback(
    () => {
      if (!train) return;
      setExpenses(createDefaultExpenses(getParams(train)));
      setResults(null);
    },
    [train, getParams]
  );

  const handleExpenseChange = useCallback(
    (id: string, field: keyof ExpenseItem, value: unknown) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      );
      setResults(null);
    },
    []
  );

  const handleCalculate = useCallback(() => {
    if (!train) return;
    const res = calculateExpenses(expenses, getParams(train));
    setResults(res);
  }, [expenses, train, getParams]);

  // Refresh expenses when params change
  useEffect(() => {
    if (train) refreshExpenses();
  }, [wagons, passengers, routeType, trainType, rollingStockMode, tariffs]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <TrainSearch onTrainFound={handleTrainFound} />

      {train && (
        <>
          <TrainParams
            wagons={wagons}
            passengers={passengers}
            routeType={routeType}
            trainType={trainType}
            rollingStockMode={rollingStockMode}
            onWagonsChange={setWagons}
            onPassengersChange={setPassengers}
            onRouteTypeChange={setRouteType}
            onTrainTypeChange={setTrainType}
            onRollingStockModeChange={setRollingStockMode}
            disabled={!editAllowed}
          />

          <ExpenseTracker
            expenses={expenses}
            onExpenseChange={handleExpenseChange}
            disabled={!editAllowed}
          />

          {calcAllowed && (
            <Button onClick={handleCalculate} className="w-full h-14 text-lg font-semibold gap-2" size="lg">
              <Calculator className="h-5 w-5" />
              Рассчитать расходы
            </Button>
          )}

          {results && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <ResultsBlock results={results} wagons={wagons} passengers={passengers} />
            </div>
          )}
        </>
      )}

      {!train && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Введите номер поезда или направление для начала работы</p>
          <p className="text-xs mt-1">Доступны: T009, T001, T005</p>
        </div>
      )}
    </div>
  );
}
