import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Train, TrendingUp, TrendingDown, Eye, ArrowLeft, BarChart3 } from "lucide-react";
import { loadCalculations, deleteCalculation, type SavedCalculation } from "@/lib/train-data";
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Сохранённые расчёты
            {calculations.length > 0 && (
              <Badge variant="secondary" className="ml-auto">{calculations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {calculations.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Нет сохранённых расчётов</p>
              <p className="text-xs text-muted-foreground mt-1">Выполните расчёт на странице «Расчёт» и сохраните результат</p>
            </div>
          ) : (
            calculations.map((calc) => {
              const isProfit = calc.financial.financialResult >= 0;
              return (
                <Card key={calc.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Train className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-sm">Поезд №{calc.trainNumber}</span>
                          <Badge variant={isProfit ? "secondary" : "destructive"} className="gap-1 text-[10px]">
                            {isProfit ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {calc.financial.financialResult.toLocaleString("ru-RU")} ₸
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{calc.trainRoute}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(calc.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>

                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedCalc(calc); setReportType("full"); }}>
                            <Eye className="h-3 w-3" /> Полный отчёт
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedCalc(calc); setReportType("cost"); }}>
                            <Eye className="h-3 w-3" /> Себестоимость
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedCalc(calc); setReportType("executive"); }}>
                            <Eye className="h-3 w-3" /> Для руководства
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleDownloadPdf(calc, "full")}>
                            <Download className="h-3 w-3" /> PDF
                          </Button>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(calc.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportView({ calc, type, onBack, onDownload }: { calc: SavedCalculation; type: "full" | "cost" | "executive"; onBack: () => void; onDownload: () => void }) {
  const isProfit = calc.financial.financialResult >= 0;
  const titles = { full: "Отчёт по рейсу", cost: "Себестоимость рейса", executive: "Отчёт для руководства" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <h2 className="text-lg font-bold flex-1">{titles[type]}</h2>
        <Button size="sm" onClick={onDownload} className="gap-1">
          <Download className="h-4 w-4" /> Скачать PDF
        </Button>
      </div>

      {/* Train info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Train className="h-5 w-5 text-primary" />
            <span className="font-bold">Поезд №{calc.trainNumber}</span>
          </div>
          <p className="text-sm text-muted-foreground">{calc.trainRoute}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Время в пути: {calc.trainInfo.duration} · {calc.trainInfo.distanceKm} км · {calc.productionMetrics.totalWagons} вагонов
          </p>
        </CardContent>
      </Card>

      {/* Production metrics - full report only */}
      {type === "full" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Производственные показатели</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Вагонов", value: calc.productionMetrics.totalWagons },
                { label: "Мест", value: calc.productionMetrics.totalSeats },
                { label: "Пробег", value: `${calc.productionMetrics.mileageThousKm.toFixed(1)} тыс.км` },
                { label: "Местооборот", value: `${calc.productionMetrics.seatTurnover.toFixed(1)} тыс.` },
                { label: "Вместимость", value: `${calc.productionMetrics.occupancyPercent}%` },
                { label: "Пасс. оборот", value: `${calc.productionMetrics.passengerTurnover.toFixed(1)} тыс.` },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/50 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                  <p className="text-sm font-bold">{m.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue - full & executive */}
      {(type === "full" || type === "executive") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" /> Доходы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Билеты</span>
                <span className="font-mono">{(calc.revenue.ticketPrice * calc.revenue.passengers).toLocaleString("ru-RU")} ₸</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Бельё</span>
                <span className="font-mono">{(calc.revenue.linenPrice * calc.revenue.linenPassengers).toLocaleString("ru-RU")} ₸</span>
              </div>
              {calc.revenue.subsidy > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Субсидии</span>
                  <span className="font-mono">{calc.revenue.subsidy.toLocaleString("ru-RU")} ₸</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-sm font-bold">
                <span>Итого доходы</span>
                <span className="text-success">{calc.financial.totalRevenue.toLocaleString("ru-RU")} ₸</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" /> Расходы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(calc.results.byGroup).map(([group, amount]) => (
              <div key={group} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{group}</span>
                <span className="font-mono">{amount.toLocaleString("ru-RU")} ₸</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between text-sm font-bold">
              <span>Итого расходы</span>
              <span className="text-destructive">{calc.results.total.toLocaleString("ru-RU")} ₸</span>
            </div>
          </div>

          {type === "cost" && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">На вагон</p>
                <p className="text-lg font-bold">{Math.round(calc.results.costPerWagon).toLocaleString("ru-RU")} ₸</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">На пассажира</p>
                <p className="text-lg font-bold">{Math.round(calc.results.costPerPassenger).toLocaleString("ru-RU")} ₸</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial result */}
      <Card className={`border-2 ${isProfit ? "border-success/40" : "border-destructive/40"}`}>
        <CardContent className="p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase mb-1">Финансовый результат</p>
          <p className={`text-3xl font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
            {calc.financial.financialResult.toLocaleString("ru-RU")} ₸
          </p>
          <Badge variant="secondary" className="mt-2 text-xs">
            Маржа: {calc.financial.profitMargin.toFixed(1)}%
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
