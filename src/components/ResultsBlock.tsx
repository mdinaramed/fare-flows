import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { CalculationResult } from "@/lib/train-data";

interface ResultsBlockProps {
  results: CalculationResult;
  wagons: number;
  passengers: number;
}

export function ResultsBlock({ results }: ResultsBlockProps) {
  const maxVal = Math.max(...Object.values(results.byGroup), 1);

  return (
    <div className="space-y-3">
      {results.anomalies.length > 0 && (
        <Card className="border-destructive/30">
          <CardContent className="py-3 space-y-1.5">
            {results.anomalies.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">{a.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide">
            Расходы по категориям
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(results.byGroup).map(([group, amount]) => (
            <div key={group}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{group}</span>
                <span className="font-mono">{amount.toLocaleString("ru-RU")} тг</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(amount / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
            <div className="rounded bg-muted/60 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Итого</p>
              <p className="text-sm font-bold">{results.total.toLocaleString("ru-RU")} тг</p>
            </div>
            <div className="rounded bg-muted/60 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">На вагон</p>
              <p className="text-sm font-bold">{Math.round(results.costPerWagon).toLocaleString("ru-RU")} тг</p>
            </div>
            <div className="rounded bg-muted/60 p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">На пасс.</p>
              <p className="text-sm font-bold">{Math.round(results.costPerPassenger).toLocaleString("ru-RU")} тг</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
