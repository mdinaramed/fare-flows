import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrainSearch } from "@/components/TrainSearch";
import { TrainParams } from "@/components/TrainParams";
import { ProductionBlock } from "@/components/ProductionBlock";
import { RevenueBlock } from "@/components/RevenueBlock";
import { ExpenseTracker } from "@/components/ExpenseTracker";
import { ResultsBlock } from "@/components/ResultsBlock";
import { FinancialResultBlock } from "@/components/FinancialResultBlock";
import { Calculator, Save, CheckCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { canEdit, canCalculate } from "@/lib/roles";
import { loadTariffs } from "@/lib/storage";
import { toast } from "sonner";
import {
  type TrainInfo,
  type RouteType,
  type TrainType,
  type TariffSettings,
  type ExpenseItem,
  type CalculationResult,
  type CalculationParams,
  type WagonTypeRow,
  type RevenueData,
  type ProductionMetrics,
  type FinancialSummary,
  DEFAULT_WAGON_TYPES,
  createDefaultExpenses,
  calculateExpenses,
  calcProductionMetrics,
  calcRevenue,
  calcFinancialResult,
  saveCalculation,
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
          <header className="h-11 flex items-center border-b bg-card/90 backdrop-blur-sm sticky top-0 z-10 px-3">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-sm font-semibold">Расчёт расходов</h1>
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
  const [routeType, setRouteType] = useState<RouteType>("social");
  const [trainType, setTrainType] = useState<TrainType>("standard");
  const [rollingStockMode, setRollingStockMode] = useState<"rent" | "depreciation">("rent");
  const [tariffs] = useState<TariffSettings>(loadTariffs());
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [saved, setSaved] = useState(false);

  const [wagonTypes, setWagonTypes] = useState<WagonTypeRow[]>(DEFAULT_WAGON_TYPES);
  const [occupancy, setOccupancy] = useState(70);

  const [revenue, setRevenue] = useState<RevenueData>({
    ticketPrice: 8500,
    passengers: 360,
    subsidy: 0,
  });

  const [financial, setFinancial] = useState<FinancialSummary | null>(null);

  const prodMetrics: ProductionMetrics = train
    ? calcProductionMetrics(wagonTypes, train.distanceKm, occupancy)
    : { totalWagons: 0, totalSeats: 0, mileageThousKm: 0, seatTurnover: 0, occupancyPercent: 0, passengerTurnover: 0, avgDistance: 0 };

  const totalWagons = wagonTypes.reduce((s, w) => s + w.count, 0);
  const totalPassengers = Math.round(prodMetrics.totalSeats * (occupancy / 100));

  const getParams = useCallback(
    (t: TrainInfo): CalculationParams => ({
      wagons: totalWagons, passengers: totalPassengers, routeType, trainType, rollingStockMode, train: t, tariffs,
    }),
    [totalWagons, totalPassengers, routeType, trainType, rollingStockMode, tariffs]
  );

  const handleTrainFound = useCallback(
    (t: TrainInfo) => {
      setTrain(t);
      setResults(null);
      setFinancial(null);
      setSaved(false);
      setExpenses(createDefaultExpenses({ wagons: totalWagons, passengers: totalPassengers, routeType, trainType, rollingStockMode, train: t, tariffs }));
    },
    [totalWagons, totalPassengers, routeType, trainType, rollingStockMode, tariffs]
  );

  const refreshExpenses = useCallback(() => {
    if (!train) return;
    setExpenses(createDefaultExpenses(getParams(train)));
    setResults(null);
    setFinancial(null);
    setSaved(false);
  }, [train, getParams]);

  const handleExpenseChange = useCallback((id: string, field: keyof ExpenseItem, value: unknown) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    setResults(null);
    setFinancial(null);
    setSaved(false);
  }, []);

  const handleWagonChange = useCallback((id: string, field: keyof WagonTypeRow, value: number) => {
    setWagonTypes((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  }, []);

  const handleRevenueChange = useCallback((field: keyof RevenueData, value: number) => {
    setRevenue((prev) => ({ ...prev, [field]: value }));
    setFinancial(null);
    setSaved(false);
  }, []);

  const handleCalculate = useCallback(() => {
    if (!train) return;
    const res = calculateExpenses(expenses, getParams(train));
    setResults(res);
    const { totalRevenue } = calcRevenue(revenue);
    setFinancial(calcFinancialResult(totalRevenue, res.total));
    setSaved(false);
  }, [expenses, train, getParams, revenue]);

  const handleSave = useCallback(() => {
    if (!train || !results || !financial) return;
    saveCalculation({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      trainNumber: train.number,
      trainRoute: train.route,
      trainInfo: train,
      wagonTypes,
      occupancy,
      routeType,
      trainType,
      rollingStockMode,
      revenue,
      expenses,
      results,
      financial,
      productionMetrics: prodMetrics,
    });
    setSaved(true);
    toast.success("Расчёт сохранён", { description: `Поезд ${train.number} · ${train.route}` });
  }, [train, results, financial, wagonTypes, occupancy, routeType, trainType, rollingStockMode, revenue, expenses, prodMetrics]);

  useEffect(() => {
    if (train) refreshExpenses();
  }, [totalWagons, totalPassengers, routeType, trainType, rollingStockMode, tariffs]);

  return (
    <div className="p-4">
      {/* Search always on top, full width */}
      <div className="mb-4">
        <TrainSearch onTrainFound={handleTrainFound} />
      </div>

      {train && (
        <>
          {/* Dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            <TrainParams
              wagons={totalWagons} passengers={totalPassengers}
              routeType={routeType} trainType={trainType} rollingStockMode={rollingStockMode}
              onWagonsChange={() => {}} onPassengersChange={() => {}}
              onRouteTypeChange={setRouteType} onTrainTypeChange={setTrainType}
              onRollingStockModeChange={setRollingStockMode}
              disabled={!editAllowed}
            />
            <ProductionBlock
              wagonTypes={wagonTypes} onWagonChange={handleWagonChange}
              metrics={prodMetrics} occupancy={occupancy} onOccupancyChange={setOccupancy}
              disabled={!editAllowed}
            />
            <RevenueBlock revenue={revenue} onRevenueChange={handleRevenueChange} disabled={!editAllowed} />
          </div>

          {/* Expenses full width */}
          <div className="mb-4">
            <ExpenseTracker expenses={expenses} onExpenseChange={handleExpenseChange} disabled={!editAllowed} />
          </div>

          {/* Calculate button */}
          {calcAllowed && (
            <Button onClick={handleCalculate} className="w-full h-11 font-semibold gap-2 mb-4" size="lg">
              <Calculator className="h-4 w-4" />
              Рассчитать
            </Button>
          )}

          {/* Results grid */}
          {results && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ResultsBlock results={results} wagons={totalWagons} passengers={totalPassengers} />
              {financial && <FinancialResultBlock summary={financial} />}
            </div>
          )}

          {/* Save */}
          {results && (
            <Button
              variant={saved ? "secondary" : "default"}
              className="w-full h-10 gap-2"
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Расчёт сохранён" : "Сохранить расчёт"}
            </Button>
          )}
        </>
      )}

      {!train && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Введите номер поезда или выберите из списка</p>
          <p className="text-xs mt-1">Доступны поезда: 066, 323, 086</p>
        </div>
      )}
    </div>
  );
}
