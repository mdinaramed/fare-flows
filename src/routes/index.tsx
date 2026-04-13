import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TrainSearch } from "@/components/TrainSearch";
import { TrainParams } from "@/components/TrainParams";
import { ExpenseTracker } from "@/components/ExpenseTracker";
import { ResultsBlock } from "@/components/ResultsBlock";
import { TariffSettingsBlock } from "@/components/TariffSettingsBlock";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import {
  type TrainInfo,
  type RouteType,
  type TariffSettings,
  type ExpenseItem,
  DEFAULT_TARIFFS,
  createDefaultExpenses,
  calculateExpenses,
} from "@/lib/train-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoPlan Hub — Калькулятор расходов пассажирских поездов" },
      { name: "description", content: "Расчёт расходов пассажирских железнодорожных поездов." },
    ],
  }),
  component: IndexGuard,
});

function IndexGuard() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  if (typeof window !== "undefined" && !sessionStorage.getItem("demo_auth")) {
    navigate({ to: "/login" });
    return null;
  }

  if (!authed && typeof window !== "undefined") {
    setAuthed(true);
  }

  return <IndexPage />;
}

function Index() {
  const navigate = useNavigate();

  // Demo auth check
  if (typeof window !== "undefined" && !sessionStorage.getItem("demo_auth")) {
    navigate({ to: "/login" });
    return null;
  }

  const [train, setTrain] = useState<TrainInfo | null>(null);
  const [wagons, setWagons] = useState(10);
  const [routeType, setRouteType] = useState<RouteType>("social");
  const [nightHours, setNightHours] = useState(4);
  const [tariffs, setTariffs] = useState<TariffSettings>(DEFAULT_TARIFFS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() =>
    createDefaultExpenses(DEFAULT_TARIFFS, 10)
  );
  const [results, setResults] = useState<{ byGroup: Record<string, number>; total: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleTrainFound = useCallback((t: TrainInfo) => {
    setTrain(t);
    setResults(null);
  }, []);

  const handleWagonsChange = useCallback(
    (v: number) => {
      setWagons(v);
      setExpenses(createDefaultExpenses(tariffs, v));
      setResults(null);
    },
    [tariffs]
  );

  const handleRouteTypeChange = useCallback((v: RouteType) => {
    setRouteType(v);
    setResults(null);
  }, []);

  const handleExpenseChange = useCallback(
    (id: string, field: keyof ExpenseItem, value: unknown) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
      );
      setResults(null);
    },
    []
  );

  const handleTariffChange = useCallback(
    (key: keyof TariffSettings, value: number) => {
      const newTariffs = { ...tariffs, [key]: value };
      setTariffs(newTariffs);
      setExpenses(createDefaultExpenses(newTariffs, wagons));
      setResults(null);
    },
    [tariffs, wagons]
  );

  const handleCalculate = useCallback(() => {
    const res = calculateExpenses(expenses, routeType, nightHours);
    setResults(res);
  }, [expenses, routeType, nightHours]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-lg">🚂</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">РасходЖД</h1>
            <p className="text-xs text-muted-foreground">Калькулятор расходов поездов</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Step 1: Train Search */}
        <TrainSearch onTrainFound={handleTrainFound} />

        {train && (
          <>
            {/* Step 2: Parameters */}
            <TrainParams
              wagons={wagons}
              routeType={routeType}
              onWagonsChange={handleWagonsChange}
              onRouteTypeChange={handleRouteTypeChange}
            />

            {/* Step 3: Expense Tracker */}
            <ExpenseTracker
              expenses={expenses}
              nightHours={nightHours}
              onExpenseChange={handleExpenseChange}
              onNightHoursChange={setNightHours}
            />

            {/* Calculate Button */}
            <Button
              onClick={handleCalculate}
              className="w-full h-14 text-lg font-semibold gap-2"
              size="lg"
            >
              <Calculator className="h-5 w-5" />
              Рассчитать расходы
            </Button>

            {/* Step 4: Results */}
            {results && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <ResultsBlock byGroup={results.byGroup} total={results.total} />
              </div>
            )}

            {/* Settings */}
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Настройки тарифов
              </button>
              {showSettings && (
                <div className="mt-3 animate-in fade-in-50 duration-300">
                  <TariffSettingsBlock tariffs={tariffs} onTariffChange={handleTariffChange} />
                </div>
              )}
            </div>
          </>
        )}

        {!train && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Введите номер поезда для начала работы</p>
            <p className="text-xs mt-1">Доступны: T009, T001, T005</p>
          </div>
        )}
      </main>
    </div>
  );
}
