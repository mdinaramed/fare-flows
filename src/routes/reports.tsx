import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Eye, ArrowLeft } from "lucide-react";
import { loadCalculations, deleteCalculation, type SavedCalculation } from "@/lib/train-data";
import { calcRevenue } from "@/lib/train-data";
import { generatePdfReport } from "@/lib/pdf-report";

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
          <header className="h-11 flex items-center border-b bg-card/90 backdrop-blur-sm sticky top-0 z-10 px-3">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-sm font-semibold">Отчёты</h1>
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
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [selectedCalc, setSelectedCalc] = useState<SavedCalculation | null>(null);
  const [reportType, setReportType] = useState<"full" | "cost" | "executive" | null>(null);

  useEffect(() => {
    setCalculations(loadCalculations());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteCalculation(id);
    setCalculations(loadCalculations());
    if (selectedCalc?.id === id) {
      setSelectedCalc(null);
      setReportType(null);
    }
  }, [selectedCalc]);

  const handleDownloadPdf = useCallback((calc: SavedCalculation, type: "full" | "cost" | "executive") => {
    generatePdfReport(calc, type);
  }, []);

  if (reportType && selectedCalc) {
    return (
      <ReportView
        calc={selectedCalc}
        type={reportType}
        onBack={() => { setReportType(null); setSelectedCalc(null); }}
        onDownload={() => handleDownloadPdf(selectedCalc, reportType)}
      />
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Сохранённые расчёты ({calculations.length})
        </h2>
      </div>

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Нет сохранённых расчётов</p>
            <p className="text-xs text-muted-foreground mt-1">Выполните расчёт и сохраните результат</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {calculations.map((calc) => {
            const isProfit = calc.financial.financialResult >= 0;
            return (
              <Card key={calc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">Поезд {calc.trainNumber}</p>
                      <p className="text-xs text-muted-foreground">{calc.trainRoute}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(calc.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
                        {calc.financial.financialResult.toLocaleString("ru-RU")} тг
                      </p>
                      <p className="text-[10px] text-muted-foreground">{isProfit ? "прибыль" : "убыток"}</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedCalc(calc); setReportType("full"); }}>
                      <Eye className="h-3 w-3" /> Полный
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedCalc(calc); setReportType("cost"); }}>
                      <Eye className="h-3 w-3" /> Себестоимость
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedCalc(calc); setReportType("executive"); }}>
                      <Eye className="h-3 w-3" /> Руководство
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDownloadPdf(calc, "full")}>
                      <Download className="h-3 w-3" /> PDF
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive ml-auto" onClick={() => handleDelete(calc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReportView({ calc, type, onBack, onDownload }: { calc: SavedCalculation; type: "full" | "cost" | "executive"; onBack: () => void; onDownload: () => void }) {
  const isProfit = calc.financial.financialResult >= 0;
  const titles = {
    full: "Отчёт по экономической эффективности рейса",
    cost: "Отчёт по себестоимости рейса",
    executive: "Сводный отчёт для руководства",
  };
  const { ticketRevenue, totalRevenue } = calcRevenue(calc.revenue);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <h2 className="text-sm font-semibold flex-1">{titles[type]}</h2>
        <Button size="sm" onClick={onDownload} className="gap-1">
          <Download className="h-4 w-4" /> Скачать PDF
        </Button>
      </div>

      {/* General info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Общая информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Поезд</span><span className="font-medium">{calc.trainNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Маршрут</span><span className="font-medium">{calc.trainRoute}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Время в пути</span><span className="font-medium">{calc.trainInfo.duration}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Расстояние</span><span className="font-medium">{calc.trainInfo.distanceKm} км</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Вагонов</span><span className="font-medium">{calc.productionMetrics.totalWagons}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Мест</span><span className="font-medium">{calc.productionMetrics.totalSeats}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Production - full only */}
      {type === "full" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Производственные показатели</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Пробег", value: `${calc.productionMetrics.mileageThousKm.toFixed(1)} тыс. ваг-км` },
                { label: "Местооборот", value: `${calc.productionMetrics.seatTurnover.toFixed(1)} тыс.` },
                { label: "Вместимость", value: `${calc.productionMetrics.occupancyPercent}%` },
                { label: "Пасс. оборот", value: `${calc.productionMetrics.passengerTurnover.toFixed(1)} тыс.` },
                { label: "Ср. дальность", value: `${calc.productionMetrics.avgDistance} км` },
              ].map((m) => (
                <div key={m.label} className="rounded bg-muted/50 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                  <p className="text-sm font-semibold">{m.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue */}
      {(type === "full" || type === "executive") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Доходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доход от билетов</span>
                <span className="font-mono">{ticketRevenue.toLocaleString("ru-RU")} тг</span>
              </div>
              {calc.revenue.subsidy > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Субсидии</span>
                  <span className="font-mono">{calc.revenue.subsidy.toLocaleString("ru-RU")} тг</span>
                </div>
              )}
              <div className="border-t pt-1.5 flex justify-between font-semibold">
                <span>Итого доходы</span>
                <span className="text-success">{totalRevenue.toLocaleString("ru-RU")} тг</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Расходы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 text-sm">
            {Object.entries(calc.results.byGroup).map(([group, amount]) => (
              <div key={group} className="flex justify-between">
                <span className="text-muted-foreground">{group}</span>
                <span className="font-mono">{amount.toLocaleString("ru-RU")} тг</span>
              </div>
            ))}
            <div className="border-t pt-1.5 flex justify-between font-semibold">
              <span>Итого расходы</span>
              <span className="text-destructive">{calc.results.total.toLocaleString("ru-RU")} тг</span>
            </div>
          </div>

          {type === "cost" && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded bg-muted/50 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">На вагон</p>
                <p className="text-sm font-bold">{Math.round(calc.results.costPerWagon).toLocaleString("ru-RU")} тг</p>
              </div>
              <div className="rounded bg-muted/50 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">На пассажира</p>
                <p className="text-sm font-bold">{Math.round(calc.results.costPerPassenger).toLocaleString("ru-RU")} тг</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial result */}
      <Card className={`border-2 ${isProfit ? "border-success/40" : "border-destructive/40"}`}>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Доходы</p>
              <p className="text-base font-bold text-success">{calc.financial.totalRevenue.toLocaleString("ru-RU")} тг</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Расходы</p>
              <p className="text-base font-bold text-destructive">{calc.financial.totalExpenses.toLocaleString("ru-RU")} тг</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">{isProfit ? "Прибыль" : "Убыток"}</p>
              <p className={`text-base font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
                {calc.financial.financialResult.toLocaleString("ru-RU")} тг
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Рентабельность: {calc.financial.profitMargin.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
