import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { CalculationResult } from "@/lib/train-data";

const GROUP_COLORS: Record<string, string> = {
  "МЖС": "bg-chart-1",
  "Станционные": "bg-chart-2",
  "Подвижной состав": "bg-chart-3",
  "ФОТ": "bg-chart-4",
  "Расходники": "bg-chart-5",
};

interface ResultsBlockProps {
  results: CalculationResult;
  wagons: number;
  passengers: number;
}

export function ResultsBlock({ results, wagons, passengers }: ResultsBlockProps) {
  const maxVal = Math.max(...Object.values(results.byGroup), 1);

  return (
    <div className="space-y-4">
      {/* Anomalies */}
      {results.anomalies.length > 0 && (
        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 space-y-2">
            {results.anomalies.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">{a.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main results */}
      <Card className="border-2 border-success/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-success" />
            Результат расчёта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(results.byGroup).map(([group, amount]) => (
              <div key={group}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{group}</span>
                  <span className="font-mono">{amount.toLocaleString("ru-RU")} ₸</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${GROUP_COLORS[group] || "bg-primary"}`}
                    style={{ width: `${(amount / maxVal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl bg-primary/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Итого</p>
              <p className="text-lg font-bold text-primary">
                {results.total.toLocaleString("ru-RU")} ₸
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">На вагон</p>
              <p className="text-lg font-bold text-foreground">
                {Math.round(results.costPerWagon).toLocaleString("ru-RU")} ₸
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">На пассажира</p>
              <p className="text-lg font-bold text-foreground">
                {Math.round(results.costPerPassenger).toLocaleString("ru-RU")} ₸
              </p>
            </div>
          </div>

          {/* Plan vs Fact */}
          {results.planVsFact.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                План vs Факт
              </p>
              <div className="space-y-2">
                {results.planVsFact.map((pv) => (
                  <div key={pv.group} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{pv.group}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        план: {pv.plan.toLocaleString("ru-RU")}
                      </span>
                      <Badge
                        variant={pv.deviation > 0 ? "destructive" : "secondary"}
                        className="text-[10px] gap-0.5"
                      >
                        {pv.deviation > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {pv.deviation > 0 ? "+" : ""}
                        {pv.deviation.toLocaleString("ru-RU")} ₸
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
